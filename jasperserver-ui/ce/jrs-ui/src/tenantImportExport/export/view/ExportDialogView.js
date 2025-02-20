/*
 * Copyright (C) 2005 - 2022 TIBCO Software Inc. All rights reserved.
 * http://www.jaspersoft.com.
 *
 * Unless you have purchased a commercial license agreement from Jaspersoft,
 * the following license terms apply:
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import _ from 'underscore';
import jrsConfigs from 'js-sdk/src/jrs.configs';
import Dialog from 'js-sdk/src/common/component/dialog/Dialog';
import ExportView from './ExportView';
import i18n from 'js-sdk/src/i18n/CommonBundle.properties';
import i18n2 from '../../../i18n/ImportExportBundle.properties';
import exportTypesEnum from '../enum/exportTypesEnum';

function parseRepoData(data) {
    if (_.isArray(data)) {
        return _.pluck(data, 'URIString');
    } else {
        return [data.URIString];
    }
}
function hasReports(data) {
    _.isArray(data) || (data = [data]);
    return !!_.reduce(data, function (memo, item) {
        return memo || !item.resourceType || item.resourceType.indexOf('ReportUnit') + 1 || item.resourceType.indexOf('ReportOptions') + 1;
    }, false);
}
export default Dialog.extend({
    constructor: function (options) {
        options || (options = {});
        this.options = options;
        Dialog.prototype.constructor.call(this, {
            model: this.model,
            resizable: true,
            modal: true,
            content: '',
            buttons: [
                {
                    label: i18n['button.export'],
                    action: 'export',
                    primary: true
                },
                {
                    label: i18n['button.cancel'],
                    action: 'cancel',
                    primary: false
                }
            ]
        });
        this.on('button:export', _.bind(this._onExportButtonClick, this));
        this.on('button:cancel', _.bind(this._closeExportDialog, this));
    },
    initialize: function (options) {
        this.exportView = new ExportView();
        this.listenTo(this.exportView.model, 'validated', function (isValid) {
            isValid ? this.buttons.enable('export') : this.buttons.disable('export');
        }, this);
        Dialog.prototype.initialize.apply(this, arguments);
    },
    openRepoDialog: function (repoData, event) {
        let eventTarget = event
            && ((event.type === 'mouseup' && event.target.ancestors().filter(element => element.hasClassName("selected"))[0])
                || (event.type === 'dataavailable' && event.target));
        var uris = parseRepoData(repoData);
        var organizationsFolderUri = jrsConfigs.organizationsFolderUri || '/organizations';
        var orgTemplateFolderUri = jrsConfigs.orgTemplateFolderUri || '/org_template';
        var subOrgRegExp = new RegExp('^(' + organizationsFolderUri + '/([^/]+))+');
        var rootOrgTemplateRegExp = new RegExp('^' + organizationsFolderUri + orgTemplateFolderUri + '(/.*)?');
        var isSubOrgLevel = !!subOrgRegExp.exec(uris[0]) && !rootOrgTemplateRegExp.exec(uris[0]);
        var renderOptions = {
                type: exportTypesEnum.REPOSITORY,
                isSubOrgLevel: isSubOrgLevel
            }, subtitle = ' ' + i18n2['export.dialog.repository.title'];
        this.addCssClasses('repository-export-dialog');
        this._openExportDialog(renderOptions, subtitle, eventTarget);
        this.exportView.model.set({
            'uris': uris,
            'includeScheduledReportJobs': hasReports(repoData)
        });
    },
    openTenantDialog: function (tenant) {
        var tenantName = ' ' + tenant.name, exportType = !tenant.isRoot() ? exportTypesEnum.TENANT : exportTypesEnum.ROOT_TENANT, renderOptions = {
            type: exportType,
            tenantId: tenant.id
        };
        this.addCssClasses('tenant-export-dialog');
        this._openExportDialog(renderOptions, tenantName);
    },
    // block default validation handlers
    fieldIsValid: function () {
    },
    fieldIsInvalid: function (error) {
    },
    _onExportButtonClick: function () {
        this.exportView.doExport();
        this._closeExportDialog();
    },
    _closeExportDialog: function () {
        this.$el.css({ width: this.width });
        this.close();
        this.$el.find('.export-view').html('');
    },
    _openExportDialog: function (renderOptions, subtitle, focusElement) {
        var title = i18n2['export.dialog.title'] + (subtitle ? subtitle : '');
        this.setContent(this.exportView.render(renderOptions).$el);
        this.setTitle(title);
        this.setReturnFocus(focusElement);
        //TODO: Find out why applyEpoxyBindings and delegateEvents should be called after new content is set.
        this.exportView.applyEpoxyBindings();
        this.exportView.delegateEvents();
        Dialog.prototype.open.apply(this, arguments);
        this.$el.css({ minHeight: this.$el.outerHeight() });
        this.width = this.$el.outerWidth();
    }
});