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

import moment from 'moment-timezone';

import  _ from 'gmp/locale.js';
import logger from 'gmp/log.js';
import {
  first,
  for_each,
  includes_id,
  is_array,
  is_defined,
  is_empty,
  map,
  select_save_id,
} from 'gmp/utils.js';

import {
  FULL_AND_FAST_SCAN_CONFIG_ID,
  OPENVAS_SCAN_CONFIG_TYPE,
  OSP_SCAN_CONFIG_TYPE,
} from 'gmp/models/scanconfig.js';

import {
  OPENVAS_DEFAULT_SCANNER_ID,
} from 'gmp/models/scanner.js';

import PropTypes from '../../utils/proptypes.js';

import Layout from '../../components/layout/layout.js';

import ImportReportDialog from '../reports/importdialog.js';

import AdvancedTaskWizard from '../../wizard/advancedtaskwizard.js';
import ModifyTaskWizard from '../../wizard/modifytaskwizard.js';
import TaskWizard from '../../wizard/taskwizard.js';

import withEntityComponent, {
  set_handlers,
} from '../../entity/withEntityComponent.js';

import TaskDialog from './dialogcontainer.js';
import ContainerTaskDialog from './containerdialog.js';

const log = logger.getLogger('web.tasks.taskcomponent');

const sort_scan_configs = scan_configs => {
  let sorted_scan_configs = {
    [OPENVAS_SCAN_CONFIG_TYPE]: [],
    [OSP_SCAN_CONFIG_TYPE]: [],
  };

  for_each(scan_configs, config => {
    let {type} = config;
    if (!is_array(sorted_scan_configs[type])) {
      sorted_scan_configs[type] = [];
    }
    sorted_scan_configs[type].push(config);
  });
  return sorted_scan_configs;
};

const DEFAULT_MAPPING = {
  onClone: 'onTaskCloneClick',
  onCloned: 'onCloned',
  onDelete: 'onTaskDeleteClick',
  onDeleted: 'onDeleted',
  onSave: 'onTaskSaveClick',
  onSaved: 'onSaved',
  onDownload: 'onTaskDownloadClick',
  onDownloaded: 'onDownloaded',
  onCreate: 'onTaskCreateClick',
  onEdit: 'onTaskEditClick',
  onReportImport: 'onReportImportClick',
  onReportImported: 'onReportImported',
  onContainerCreate: 'onContainerTaskCreateClick',
  onContainerSaved: 'onContainerSaved',
  onResume: 'onTaskResumeClick',
  onResumed: 'onResumed',
  onStart: 'onTaskStartClick',
  onStarted: 'onStarted',
  onStop: 'onTaskStopClick',
  onStopped: 'onStopped',
  onAdvancedTaskWizard: 'onAdvancedTaskWizardClick',
  onAdvancedTaskWizardSaved: 'onAdvancedTaskWizardSaved',
  onModifyTaskWizard: 'onModifyTaskWizardClick',
  onModifyTaskWizardSaved: 'onModifyTaskWizardSaved',
  onTaskWizard: 'onTaskWizardClick',
  onTaskWizardSaved: 'onTaskWizardSaved',
};

const withTaskComponent = (mapping = {}) => Component => {

  mapping = {
    ...DEFAULT_MAPPING,
    ...mapping,
  };

  class TaskComponentWrapper extends React.Component {

    constructor(...args) {
      super(...args);

      const {gmp} = this.context;

      this.cmd = gmp.task;

      this.handleReportImport = this.handleReportImport.bind(this);
      this.handleTaskResume = this.handleTaskResume.bind(this);
      this.handleSaveAdvancedTaskWizard =
        this.handleSaveAdvancedTaskWizard.bind(this);
      this.handleSaveContainerTask = this.handleSaveContainerTask.bind(this);
      this.handleSaveModifyTaskWizard =
        this.handleSaveModifyTaskWizard.bind(this);
      this.handleSaveTaskWizard = this.handleSaveTaskWizard.bind(this);
      this.handleTaskStart = this.handleTaskStart.bind(this);
      this.handleTaskStop = this.handleTaskStop.bind(this);
      this.handleTaskWizardNewClick = this.handleTaskWizardNewClick.bind(this);

      this.openAdvancedTaskWizard = this.openAdvancedTaskWizard.bind(this);
      this.openContainerTaskDialog = this.openContainerTaskDialog.bind(this);
      this.openReportImportDialog = this.openReportImportDialog.bind(this);
      this.openModifyTaskWizard = this.openModifyTaskWizard.bind(this);
      this.openStandardTaskDialog = this.openStandardTaskDialog.bind(this);
      this.openTaskDialog = this.openTaskDialog.bind(this);
      this.openTaskWizard = this.openTaskWizard.bind(this);
    }

    handleSaveContainerTask(data) {
      const {onContainerSaved} = mapping;
      const {onError} = this.props;
      const onSuccess = this.props[onContainerSaved];

      let promise;

      if (is_defined(data.task)) {
        promise = this.cmd.saveContainer(data);
      }
      else {
        promise = this.cmd.createContainer(data);
      }

      return promise.then(onSuccess, onError);
    }

    handleReportImport(data) {
      const {gmp} = this.context;
      const {onReportImported} = mapping;
      const {onError} = this.props;
      const onSuccess = this.props[onReportImported];

      return gmp.report.import(data).then(onSuccess, onError);
    }

    handleTaskStart(task) {
      const {onStarted} = mapping;
      const {onError} = this.props;
      const onSuccess = this.props[onStarted];

      return this.cmd.start(task).then(onSuccess, onError);
    }

    handleTaskStop(task) {
      const {onStopped} = mapping;
      const {onError} = this.props;
      const onSuccess = this.props[onStopped];

      return this.cmd.stop(task).then(onSuccess, onError);
    }

    handleTaskResume(task) {
      const {onResumed} = mapping;
      const {onError} = this.props;
      const onSuccess = this.props[onResumed];

      return this.cmd.resume(task).then(onSuccess, onError);
    }

    handleSaveTaskWizard(data) {
      const {gmp} = this.context;
      const {onError} = this.props;
      const {onTaskWizardSaved} = mapping;
      const onSuccess = this.props[onTaskWizardSaved];

      return gmp.wizard.runQuickFirstScan(data).then(onSuccess, onError);
    }

    handleSaveAdvancedTaskWizard(data) {
      const {gmp} = this.context;
      const {onError} = this.props;
      const {onAdvancedTaskWizardSaved} = mapping;
      const onSuccess = this.props[onAdvancedTaskWizardSaved];

      return gmp.wizard.runQuickTask(data).then(onSuccess, onError);
    }

    handleSaveModifyTaskWizard(data) {
      const {gmp} = this.context;
      const {onError} = this.props;
      const {onModifyTaskWizardSaved} = mapping;
      const onSuccess = this.props[onModifyTaskWizardSaved];

      return gmp.wizard.runModifyTask(data).then(onSuccess, onError);
    }

    handleTaskWizardNewClick() {
      this.openTaskDialog();
      this.task_wizard.close();
    }

    openContainerTaskDialog(task) {
      this.container_dialog.show({
        task,
        name: task ? task.name : _('unnamed'),
        comment: task ? task.comment : '',
        id: task ? task.id : undefined,
        in_assets: task ? task.in_assets : undefined,
        auto_delete: task ? task.auto_delete : undefined,
        auto_delete_data: task ? task.auto_delete_data : undefined,
      }, {
        title: task ? _('Edit Container Task {{name}}', task) :
          _('New Container Task'),
      });
    }

    openTaskDialog(task) {
      if (is_defined(task) && task.isContainer()) {
        this.openContainerTaskDialog(task);
      }
      else {
        this.openStandardTaskDialog(task);
      }
    }

    openStandardTaskDialog(task) {
      const {capabilities, gmp} = this.context;

      if (task) {
        gmp.task.editTaskSettings(task).then(response => {
          let settings = response.data;
          let {targets, scan_configs, alerts, scanners, schedules} = settings;

          log.debug('Loaded edit task dialog settings', settings);

          let sorted_scan_configs = sort_scan_configs(scan_configs);

          let schedule_id;
          if (capabilities.mayOp('get_schedules') &&
            !is_empty(task.schedule.id)) {
            schedule_id = task.schedule.id;
          }
          else {
            schedule_id = 0;
          }

          this.task_dialog.show({
            alert_ids: map(task.alerts, alert => alert.id),
            alerts,
            alterable: task.alterable,
            apply_overrides: task.apply_overrides,
            auto_delete: task.auto_delete,
            auto_delete_data: task.auto_delete_data,
            comment: task.comment,
            config_id: task.isAlterable() ? task.config.id : '0',
            id: task.id,
            in_assets: task.in_assets,
            min_qod: task.min_qod,
            name: task.name,
            scan_configs: sorted_scan_configs,
            scanner_id: task.isAlterable() ? task.scanner.id : '0',
            scanner_type: task.scanner.type,
            scanners,
            schedule_id,
            schedules,
            target_id: task.isAlterable() ?  task.target.id : '0',
            targets,
            task: task,
          }, {
            title: _('Edit Task {{name}}', task),
          });
        });
      }
      else {
        gmp.task.newTaskSettings().then(response => {
          let settings = response.data;
          let {schedule_id, alert_id, target_id,
            targets, scanner_id = OPENVAS_DEFAULT_SCANNER_ID, scan_configs,
            config_id = FULL_AND_FAST_SCAN_CONFIG_ID, alerts, scanners,
            schedules, tags} = settings;

          log.debug('Loaded new task dialog settings', settings);

          let sorted_scan_configs = sort_scan_configs(scan_configs);

          scanner_id = select_save_id(scanners, scanner_id);

          target_id = select_save_id(targets, target_id);

          schedule_id = select_save_id(schedules, schedule_id, '0');

          alert_id = includes_id(alerts, alert_id) ? alert_id : undefined;

          let alert_ids = is_defined(alert_id) ? [alert_id] : [];

          this.task_dialog.show({
            alert_ids,
            alerts,
            config_id,
            scanners,
            scanner_id,
            scan_configs: sorted_scan_configs,
            schedule_id,
            schedules,
            tag_name: first(tags).name,
            tags,
            target_id,
            targets,
          }, {
            title: _('New Task'),
          });
        });
      }
    }

    openReportImportDialog(task) {
      this.import_report_dialog.show({
        task_id: task.id,
        tasks: [task],
      });
    }

    openTaskWizard() {
      let {gmp} = this.context;

      this.task_wizard.show({});

      gmp.wizard.task().then(response => {
        let settings = response.data;
        this.task_wizard.setValues({
          hosts: settings.client_address,
          port_list_id: settings.get('Default Port List').value,
          alert_id: settings.get('Default Alert').value,
          config_id: settings.get('Default OpenVAS Scan Config').value,
          ssh_credential: settings.get('Default SSH Credential').value,
          smb_credential: settings.get('Default SMB Credential').value,
          esxi_credential: settings.get('Default ESXi Credential').value,
          scanner_id: settings.get('Default OpenVAS Scanner').value,
        });
      });
    }

    openAdvancedTaskWizard() {
      let {gmp} = this.context;
      gmp.wizard.advancedTask().then(response => {
        let settings = response.data;
        let config_id = settings.get('Default OpenVAS Scan Config').value;

        if (!is_defined(config_id) || config_id.length === 0) {
          config_id = FULL_AND_FAST_SCAN_CONFIG_ID;
        }

        let credentials = settings.credentials;

        let ssh_credential = select_save_id(credentials,
          settings.get('Default SSH Credential').value, '');
        let smb_credential = select_save_id(credentials,
          settings.get('Default SMB Credential').value, '');
        let esxi_credential = select_save_id(credentials,
          settings.get('Default ESXi Credential').value, '');

        let now = moment().tz(settings.timezone);

        this.advanced_task_wizard.show({
          credentials,
          scan_configs: settings.scan_configs,
          date: now,
          task_name: _('New Quick Task'),
          target_hosts: settings.client_address,
          port_list_id: settings.get('Default Port List').value,
          alert_id: settings.get('Default Alert').value,
          config_id,
          ssh_credential,
          smb_credential,
          esxi_credential,
          scanner_id: settings.get('Default OpenVAS Scanner').value,
          slave_id: settings.get('Default Slave').value,
          start_minute: now.minutes(),
          start_hour: now.hours(),
          start_timezone: settings.timezone,
        });
      });
    }

    openModifyTaskWizard() {
      let {gmp} = this.context;

      gmp.wizard.modifyTask().then(response => {
        let settings = response.data;
        let now = moment().tz(settings.timezone);

        this.modify_task_wizard.show({
          date: now,
          tasks: settings.tasks,
          reschedule: '0',
          task_id: select_save_id(settings.tasks),
          start_minute: now.minutes(),
          start_hour: now.hours(),
          start_timezone: settings.timezone,
        });
      });
    }

    render() {
      const {
        onCreate,
        onEdit,
        onSave,
        onContainerSaved,
        onContainerCreate,
        onReportImport,
        onReportImported,
        onResume,
        onResumed,
        onStart,
        onStarted,
        onStop,
        onStopped,
        onAdvancedTaskWizard,
        onAdvancedTaskWizardSaved,
        onModifyTaskWizard,
        onModifyTaskWizardSaved,
        onTaskWizard,
        onTaskWizardSaved,
      } = mapping;

      const onSaveClick  = this.props[onSave];
      const has_save = is_defined(onSaveClick);

      const handlers = {
        [onCreate]: has_save ? this.openTaskDialog : undefined,
        [onEdit]: has_save ? this.openTaskDialog : undefined,
      };

      set_handlers(handlers, this.props)(
        onContainerCreate, onContainerSaved, this.openContainerTaskDialog,
      )(
        onReportImport, onReportImported, this.openReportImportDialog,
      )(
        onResume, onResumed, this.handleTaskResume,
      )(
        onStart, onStarted, this.handleTaskStart,
      )(
        onStop, onStopped, this.handleTaskStop,
      )(
        onAdvancedTaskWizard, onAdvancedTaskWizardSaved,
        this.openAdvancedTaskWizard,
      )(
        onModifyTaskWizard, onModifyTaskWizardSaved, this.openModifyTaskWizard,
      )(
        onTaskWizard, onTaskWizardSaved, this.openTaskWizard,
      );
      return (
        <Layout>
          <Component
            {...this.props}
            {...handlers}
            onTaskWizardClick={this.openTaskWizard}
          />

          <TaskDialog
            ref={ref => this.task_dialog = ref}
            onSave={onSaveClick}/>

          <ContainerTaskDialog
            ref={ref => this.container_dialog = ref}
            onSave={this.handleSaveContainerTask}/>

          <TaskWizard
            ref={ref => this.task_wizard = ref}
            onSave={this.handleSaveTaskWizard}
            onNewClick={this.handleTaskWizardNewClick}/>
          <AdvancedTaskWizard
            ref={ref => this.advanced_task_wizard = ref}
            onSave={this.handleSaveAdvancedTaskWizard}/>
          <ModifyTaskWizard
            ref={ref => this.modify_task_wizard = ref}
            onSave={this.handleSaveModifyTaskWizard}/>

          <ImportReportDialog
            ref={ref => this.import_report_dialog = ref}
            newContainerTask={false}
            onSave={this.handleReportImport}/>
        </Layout>
      );
    }
  }

  TaskComponentWrapper.propTypes = {
    onChanged: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
  };

  TaskComponentWrapper.contextTypes = {
    gmp: PropTypes.gmp.isRequired,
    capabilities: PropTypes.capabilities.isRequired,
  };

  return withEntityComponent('task', mapping)(TaskComponentWrapper);
};

export default withTaskComponent;

// vim: set ts=2 sw=2 tw=80: