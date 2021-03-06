import { Router } from 'express';
import validate from 'validate.js';
import models from '../../models';
import { limitConstraints, offsetConstraints } from '../../validators/basic';
import {
  filtersConstraints,
  sortByConstraints,
  sortDirConstraints,
  linkConstraints,
  favoritesConstraints,
} from '../../validators/bookmark';
import { fillingWhereParameterForDate } from '../../utils/query';
import { getOpenGraphMetaProperties, getWhoIsInformation } from '../../utils/request';


const router = Router();

router.get('/', async (req, res) => {
  try {
    const {
      limit,
      offset,
      filter,
      filter_value: filterValue,
      filter_from: filterFrom,
      filter_to: filterTo,
      sort_by: sortBy,
      sort_dir: sortDir,
    } = req.query;
    const data = {
      limit, offset, sortBy, sortDir,
    };
    const constraints = {
      limit: limitConstraints,
      offset: offsetConstraints,
      sortBy: sortByConstraints,
      sortDir: sortDirConstraints,
    };
    if (filter) {
      data.filters = {
        filter, filterValue, filterFrom, filterTo,
      };
      constraints.filters = filtersConstraints;
    }
    const validationResult = validate(data, constraints);
    if (validationResult) {
      res.status(400).json({ errors: validationResult });
    } else {
      const queryParams = {
        attributes: ['guid', 'link', 'createdAt', 'description', 'favorites'],
        limit: limit || 50,
        offset: offset || 0,
        order: [[sortBy || 'createdAt', sortDir || 'ASC']],
        raw: true,
      };
      if (filter) {
        if (filter === 'createdAt') {
          queryParams.where = fillingWhereParameterForDate(filter, filterValue, filterFrom, filterTo);
        } else {
          const filterValueBoolean = !(filterValue === 'false');
          queryParams.where = { [filter]: filterValueBoolean };
        }
      }
      const queryParamsWithoutAttributes = Object.assign({}, queryParams);
      queryParamsWithoutAttributes.attributes = [];
      const [bookmarks, length] = await Promise.all([models.bookmark.findAll(queryParams), models.bookmark.count(queryParamsWithoutAttributes)]);
      bookmarks.forEach((_) => {
        _.createdAt = new Date(_.createdAt).getTime();
        _.favorites = Boolean(_.favorites);
      });
      res.json({ length, data: bookmarks });
    }
  } catch (error) {
    res.status(500).json({ errors: { backend: ["Can't get list of bookmarks"] } });
  }
});

router.post('/', async (req, res) => {
  try {
    const { favorites } = req.body;
    const validationResult = validate(req.body, {
      link: linkConstraints,
      favorites: favorites ? favoritesConstraints : undefined,
    });
    if (validationResult) {
      res.status(400).json({ errors: validationResult });
    } else {
      const bookmark = await models.bookmark.create(req.body);
      res.json({ guid: bookmark.guid, createdAt: bookmark.createdAt.getTime() });
    }
  } catch (error) {
    res.status(500).json({ errors: { backend: ["Can't post bookmark"] } });
  }
});

router.patch('/:guid', async (req, res) => {
  try {
    const { link, favorites, description } = req.body;
    const constraints = {
      favorites: favorites ? favoritesConstraints : undefined,
      link: link ? linkConstraints : undefined,
    };
    const validationResult = validate(req.body, constraints);
    if (validationResult) {
      res.status(400).json({ errors: validationResult });
    } else {
      const bookmark = await models.bookmark.findByPk(req.params.guid);
      if (!bookmark) {
        res.status(404).json({ errors: { backend: ['Not found'] } });
      }
      bookmark.link = link || bookmark.link;
      bookmark.description = description;
      bookmark.favorites = favorites || bookmark.favorites;
      await bookmark.save();
      res.status(200).json({ message: 'patch successfully' });
    }
  } catch (error) {
    res.status(500).json({ errors: { backend: ["Can't patch bookmark"] } });
  }
});

router.delete('/:guid', async (req, res) => {
  try {
    const bookmark = await models.bookmark.findByPk(req.params.guid);
    if (!bookmark) {
      res.status(404).json({ errors: { backend: ['Not found'] } });
    }
    await bookmark.destroy();
    res.status(200).json({ message: 'delete successfully' });
  } catch (error) {
    res.status(500).json({ errors: { backend: ["Can't delete bookmark"] } });
  }
});

router.get('/:guid', async (req, res) => {
  try {
    const bookmark = await models.bookmark.findByPk(req.params.guid);
    if (!bookmark) {
      res.status(404).json({ errors: { backend: ['Not found'] } });
    }
    const [og, whoIsInfo] = await Promise.all([getOpenGraphMetaProperties(bookmark.link), getWhoIsInformation(bookmark.link)]);
    res.status(200).json({ og, whoIsInfo });
  } catch (error) {
    res.status(500).json({ errors: { backend: ["Can't get bookmark", error.message] } });
  }
});

export default router;
