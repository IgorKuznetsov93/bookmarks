import models from '../models';

export function fillingWhereParameterForDate(filter, filterValue, filterFrom, filterTo) {
  const { Op } = models.sequelize;
  if (filterValue && filterTo && filterFrom) {
    return {
      [filter]: {
        [Op.or]: {
          [Op.eq]: new Date(filterValue),
          [Op.gte]: new Date(filterFrom),
          [Op.lte]: new Date(filterTo),
        },
      },
    };
  }
  if (filterValue && filterFrom) {
    return {
      [filter]: {
        [Op.or]: {
          [Op.eq]: new Date(filterValue),
          [Op.gte]: new Date(filterFrom),
        },
      },
    };
  }
  if (filterValue && filterTo) {
    return {
      [filter]: {
        [Op.or]: {
          [Op.eq]: new Date(filterValue),
          [Op.lte]: new Date(filterTo),
        },
      },
    };
  }
  if (filterValue) {
    return { [filter]: { [Op.eq]: new Date(filterValue) } };
  }
  if (filterTo && filterFrom) {
    return { [filter]: { [Op.between]: [new Date(filterFrom), new Date(filterTo)] } };
  }
  if (filterFrom) {
    return { [filter]: { [Op.gte]: new Date(filterFrom) } };
  }
  if (filterTo) {
    return { [filter]: { [Op.lte]: new Date(filterTo) } };
  }
  return {};
}
