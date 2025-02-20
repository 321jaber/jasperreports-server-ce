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

export default {
    rolesRest: {
        'role': [
            {
                'externallyDefined': false,
                'name': 'ROLE_ADMINISTRATOR'
            },
            {
                'externallyDefined': false,
                'name': 'ROLE_ANONYMOUS'
            },
            {
                'externallyDefined': false,
                'name': 'ROLE_PORTLET'
            },
            {
                'externallyDefined': false,
                'tenantId': 'organization_1',
                'name': 'ROLE_ORG500'
            }
        ]
    },
    usersRest: {
        'user': [
            {
                'username': 'anonymousUser',
                'fullName': 'anonymousUser',
                'externallyDefined': false
            },
            {
                'username': 'CaliforniaUser',
                'fullName': 'California User',
                'externallyDefined': false,
                'tenantId': 'organization_1'
            },
            {
                'username': 'demo',
                'fullName': 'Demo User',
                'externallyDefined': false,
                'tenantId': 'organization_1'
            }
        ]
    }
};