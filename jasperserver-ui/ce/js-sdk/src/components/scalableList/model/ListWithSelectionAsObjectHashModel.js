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
import BaseListWithSelectionModel from './BaseListWithSelectionModel';
var ListWithSelectionAsObjectHashModel = BaseListWithSelectionModel.extend({
    initialize: function(options) {
        BaseListWithSelectionModel.prototype.initialize.call(this, options);

        this.caseSensitiveSelection = typeof options.caseSensitiveSelection !== 'undefined' ? options.caseSensitiveSelection : true;
    },

    _addToSelection: function (value, index) {
        if (this.caseSensitiveSelection) {
            this.selection[value] = true;
        } else {
            this.selection[value.toLowerCase()] = value;
        }
    },

    _removeFromSelection: function (value, index) {
        if (!this.caseSensitiveSelection) {
            value = value.toLowerCase();
        }
        delete this.selection[value];
    },
    _clearSelection: function () {
        this.selection = {};
    },
    _selectionContains: function (value, index) {
        if (!this.caseSensitiveSelection) {
            value = value.toLowerCase();
        }
        return this.selection[value];
    },
    _getSelection: function () {
        if (this.caseSensitiveSelection) {
            return _.keys(this.selection);
        }
        return _.values(this.selection);
    },
    select: function (selection, options) {
        this._clearSelection();
        if (typeof selection === 'string') {
            this._addToSelection(selection);
        } else if (_.isArray(selection)) {
            for (var i = 0; i < selection.length; i++) {
                this._addToSelection(selection[i]);
            }
        } else if (typeof selection !== 'undefined') {
            for (var key in selection) {
                if (selection.hasOwnProperty(key)) {
                    var value = selection[key];
                    if (value !== undefined) {
                        this._addToSelection(value, key);
                    }
                }
            }
        }
        this._afterSelect && this._afterSelect(selection, options);
        this._triggerSelectionChange(options);
    }
});
export default ListWithSelectionAsObjectHashModel;