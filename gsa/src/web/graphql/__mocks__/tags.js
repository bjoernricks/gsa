/* Copyright (C) 2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import {getEntityType} from 'gmp/utils/entitytype';

import {
  CREATE_TAG,
  MODIFY_TAG,
  TOGGLE_TAG,
  REMOVE_TAG,
  ENTITY_TYPES,
  BULK_TAG,
} from '../tags';

import {createGenericQueryMock} from 'web/utils/testing';

export const createTagInput = {
  name: 'foo',
  resourceType: 'OPERATING_SYSTEM',
};

const createTagResult = {
  createTag: {
    id: '12345',
    status: 200,
  },
};

export const createTagQueryMock = createGenericQueryMock(
  CREATE_TAG,
  createTagResult,
  {input: createTagInput},
);

export const modifyTagInput = {
  id: '12345',
};

const modifyTagResult = {
  modifyTag: {
    ok: true,
  },
};

export const modifyTagQueryMock = createGenericQueryMock(
  MODIFY_TAG,
  modifyTagResult,
  {input: modifyTagInput},
);

const toggleTagResult = {
  toggleTag: {
    ok: true,
  },
};

export const createToggleTagQueryMock = (tag, active) => {
  return createGenericQueryMock(TOGGLE_TAG, toggleTagResult, {
    input: {id: tag.id, active},
  });
};

export const createRemoveTagMock = (tag, entity) => {
  const removeTagResult = jest.fn().mockReturnValue({
    data: {
      removeTag: {
        ok: true,
      },
    },
  });

  const queryMock = {
    request: {
      query: REMOVE_TAG,
      variables: {
        input: {
          id: tag.id,
          resourceIds: [entity.id],
          resourceType: ENTITY_TYPES[getEntityType(entity)],
        },
      },
    },
    newData: removeTagResult,
  };
  return [queryMock, removeTagResult];
};

export const createBulkTagMock = (
  id,
  {resourceType, resourceIds, resourceFilter},
) => {
  const bulkTagResult = {
    data: {
      bulkTag: {
        ok: true,
      },
    },
  };

  const resultFunc = jest.fn().mockReturnValue(bulkTagResult);

  const queryMock = {
    request: {
      query: BULK_TAG,
      variables: {
        input: {
          id,
          resourceIds,
          resourceType,
          resourceFilter,
        },
      },
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};
