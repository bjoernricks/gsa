/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import React from 'react';

import _ from '../../locale.js';

import PropTypes from '../utils/proptypes.js';

import {withEntitiesHeader} from '../entities/header.js';

import TableHead from '../components/table/head.js';
import TableHeader from '../components/table/header.js';
import TableRow from '../components/table/row.js';

const Header = ({
    actions,
    filter,
    links = true,
    sort = true,
    onSortChange,
  }) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          sortby={sort ? 'name' : false}
          onSortChange={onSortChange}>
          {_('Name')}
        </TableHead>
        <TableHead
          sortby={sort ? 'roles' : false}
          onSortChange={onSortChange}>
          {_('Roles')}
        </TableHead>
        <TableHead
          sortby={sort ? 'groups' : false}
          onSortChange={onSortChange}>
          {_('Groups')}
        </TableHead>
        <TableHead
          sortby={sort ? 'host_access' : false}
          onSortChange={onSortChange}>
          {_('Host Access')}
        </TableHead>
        <TableHead
          sortby={sort ? 'ldap' : false}
          onClick={onSortChange}>
          {_('Authentication Type')}
        </TableHead>
        {actions}
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  actions: PropTypes.element,
  filter: PropTypes.filter,
  links: PropTypes.bool,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

export default withEntitiesHeader(Header);

// vim: set ts=2 sw=2 tw=80:
