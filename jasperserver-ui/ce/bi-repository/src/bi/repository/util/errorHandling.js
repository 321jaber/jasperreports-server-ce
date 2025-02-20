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
import logger from "js-sdk/src/common/logging/logger"
import i18n from '../../../i18n/RepositoryResourceBundle.properties';

var log = logger.register('ResourceErrors');

function _invokeErrorHandler(xhr, errorMessages) {
    var handler = errorMessages[xhr.status] || errorMessages['unknown'];
    if (_.isString(handler)) {
        return errorMessages[xhr.status];
    } else if (_.isFunction(handler)) {
        return handler(xhr);
    }
}
export default {
    mapXhrErrorToMessage: function (xhr, errorMessages) {
        var msg, messageFromXhr = xhr && xhr.responseJSON && xhr.responseJSON.message, errorCodeFromXhr = xhr && xhr.responseJSON && xhr.responseJSON.errorCode;
        msg = _invokeErrorHandler(xhr, errorMessages) || messageFromXhr || i18n['error.unknown.error'];
        log.warn(xhr.status, errorCodeFromXhr, messageFromXhr);
        return msg;
    }
};