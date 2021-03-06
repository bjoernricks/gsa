/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React, {useReducer} from 'react';

import _ from 'gmp/locale';

import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';

import EntityComponent from 'web/entity/component';

import {useCreateHost, useDeleteHost, useModifyHost} from 'web/graphql/hosts';

import HostDialog from 'web/pages/hosts/dialog';
import TargetComponent from 'web/pages/targets/component';

import PropTypes from 'web/utils/proptypes';
import SelectionType from 'web/utils/selectiontype';
import stateReducer, {updateState} from 'web/utils/stateReducer';

const HostComponent = ({
  children,
  createtarget,
  entitiesCounts,
  onCreated,
  onCreateError,
  onDeleted,
  onDeleteError,
  onDownloaded,
  onDownloadError,
  onIdentifierDeleted,
  onIdentifierDeleteError,
  onInteraction,
  onSaved,
  onSaveError,
}) => {
  const [state, dispatchState] = useReducer(stateReducer, {
    dialogVisible: false,
  });

  const [createHost] = useCreateHost();
  const [modifyHost] = useModifyHost();
  const [deleteHost] = useDeleteHost();

  const handleIdentifierDelete = identifier => {
    handleInteraction();

    return deleteHost(identifier.id).then(
      onIdentifierDeleted,
      onIdentifierDeleteError,
    );
  };

  const openHostDialog = host => {
    let title;

    if (isDefined(host)) {
      title = _('Edit Host {{name}}', {name: shorten(host.name)});
    }

    dispatchState(
      updateState({
        dialogVisible: true,
        host,
        title,
      }),
    );

    handleInteraction();
  };

  const closeHostDialog = () => {
    dispatchState(updateState({dialogVisible: false}));
  };

  const handleCloseHostDialog = () => {
    closeHostDialog();
    handleInteraction();
  };

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const openCreateTargetDialog = host => {
    _openTargetDialog(1, 'uuid=' + host.id);
  };

  const openCreateTargetSelectionDialog = data => {
    const {entities, entitiesSelected, selectionType, filter} = data;
    let size;
    let filterstring;

    if (selectionType === SelectionType.SELECTION_USER) {
      const hosts = [...entitiesSelected]; // convert set to array
      size = entitiesSelected.size;
      filterstring = map(hosts, host => 'uuid=' + host.id).join(' ');
    } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      size = entities.length;
      filterstring = filter.toFilterString();
    } else {
      const counts = entitiesCounts;
      size = counts.filtered;
      filterstring = filter.all().toFilterString();
    }
    _openTargetDialog(size, filterstring);
  };

  const _openTargetDialog = (count, filterstring) => {
    createtarget({
      target_source: 'asset_hosts',
      hosts_count: count,
      hosts_filter: filterstring,
    });
  };

  const handleSaveHost = data => {
    handleInteraction();

    const {id, comment, name} = data;

    if (isDefined(id)) {
      return modifyHost({id, comment})
        .then(onSaved, onSaveError)
        .then(() => closeHostDialog());
    }

    return createHost({name, comment})
      .then(onCreated, onCreateError)
      .then(() => closeHostDialog());
  };

  const {dialogVisible, host, title} = state;

  return (
    <EntityComponent
      name="host"
      onCreated={onCreated}
      onCreateError={onCreateError}
      onDeleted={onDeleted}
      onDeleteError={onDeleteError}
      onDownloaded={onDownloaded}
      onDownloadError={onDownloadError}
      onInteraction={onInteraction}
      onSaved={onSaved}
      onSaveError={onSaveError}
    >
      {({save, ...other}) => (
        <React.Fragment>
          {children({
            ...other,
            create: openHostDialog,
            edit: openHostDialog,
            deleteidentifier: handleIdentifierDelete,
            createtargetfromselection: openCreateTargetSelectionDialog,
            createtargetfromhost: openCreateTargetDialog,
          })}
          {dialogVisible && (
            <HostDialog
              host={host}
              title={title}
              onClose={handleCloseHostDialog}
              onSave={handleSaveHost}
            />
          )}
        </React.Fragment>
      )}
    </EntityComponent>
  );
};

HostComponent.propTypes = {
  children: PropTypes.func.isRequired,
  createtarget: PropTypes.func.isRequired,
  entitiesCounts: PropTypes.counts,
  selectionType: PropTypes.string,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onIdentifierDeleteError: PropTypes.func,
  onIdentifierDeleted: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

const HostWithTargetComponent = ({
  onInteraction,
  onTargetCreated,
  onTargetCreateError,
  ...props
}) => {
  return (
    <TargetComponent
      onCreated={onTargetCreated}
      onCreateError={onTargetCreateError}
      onInteraction={onInteraction}
    >
      {({create}) => (
        <HostComponent
          {...props}
          createtarget={create}
          onInteraction={onInteraction}
        />
      )}
    </TargetComponent>
  );
};

HostWithTargetComponent.propTypes = {
  onInteraction: PropTypes.func.isRequired,
  onTargetCreateError: PropTypes.func.isRequired,
  onTargetCreated: PropTypes.func.isRequired,
};

export default HostWithTargetComponent;

// vim: set ts=2 sw=2 tw=80:
