import validate from 'validate.js';
import moment from 'moment';

validate.validators.isBoolean = function (value) {
  if (!(value === 'false' || value === 'true' || validate.isBoolean(value))) {
    return 'value must be boolean';
  }
};

validate.validators.isDate = function (value) {
  if (value) {
    const date = moment.utc(value, ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss'], true);
    if (!date.isValid()) {
      return 'must Date(YYYY-MM-DD / YYYY-MM-DD HH:mm:ss)';
    }
  }
};

validate.validators.domain = function (value) {
  if (value) {
    const URL = value.toLowerCase();
    const blockedDomains = ['yahoo.com', 'socket.io'];
    const isBlockedDomain  =  blockedDomains.find((_) => URL.includes(_));
    if (isBlockedDomain) {
      return {
        code: 'BOOKMARKS_BLOCKED_DOMAIN',
        description: `${isBlockedDomain} banned`,
      };
    }
  }
};

validate.validators.isValidFilters = function (value) {
  const {
    filter, filterValue, filterFrom, filterTo,
  } = value;
  if (filter === 'favorites') {
    const validateMessage = validate.single(filterValue, { isBoolean: { } });
    if (validateMessage) {
      return ': filterValue must be boolean when filter is favorites';
    }
  } else if (filter === 'createdAt') {
    const validateMessage = validate({ filterValue, filterFrom, filterTo }, {
      filterValue: { isDate: {} },
      filterFrom: { isDate: {} },
      filterTo: { isDate: {} },
    });
    if (validateMessage) {
      return validateMessage;
    }
  } else {
    return ': must be favorites or createAt value ';
  }
};

export const filtersConstraints = {
  isValidFilters: {
  },
};

export const sortByConstraints = {
  inclusion: {
    within: ['favorites', 'createdAt'],
    message: "^We're currently out of %{value} for sort by",
  },
};

export const sortDirConstraints = {
  inclusion: {
    within: ['asc', 'desc'],
    message: "^We're currently out of %{value} for sort dir",
  },
};

export const linkConstraints = {
  presence: { allowEmpty: false },
  url: {
    message: { code: 'BOOKMARKS_INVALID_LINK', description: 'Invalid link' },
  },
  domain: {},
  length: { maximum: 256 },
};

export const favoritesConstraints = {
  presence: { allowEmpty: false },
  isBoolean: {
  },
};
