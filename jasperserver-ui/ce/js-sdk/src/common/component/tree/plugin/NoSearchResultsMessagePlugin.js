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
import i18n from '../../../../i18n/CommonBundle.properties';
import TreePlugin from './TreePlugin';
import noResourcesFoundMessageTemplate from '../template/noResourcesFoundMessageTemplate.htm';
var _onNoResourcesResult = function (rootLevel) {
    !rootLevel.list.totalItems && rootLevel.list.$el.html(this.noResourcesFoundMessage);
};
export default TreePlugin.extend({}, {
    treeInitialized: function (options) {
        this.noResourcesFoundMessage = _.template(noResourcesFoundMessageTemplate, { msg: i18n['no.resources.found'] });
        this.listenTo(this.rootLevel, 'ready', _onNoResourcesResult);
    },
    treeRemoved: function () {
        this.stopListening(this.rootLevel, 'ready', _onNoResourcesResult);
    }
});