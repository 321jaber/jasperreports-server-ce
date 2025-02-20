/*
 * Copyright (C) 2005-2023. Cloud Software Group, Inc. All Rights Reserved.
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

package com.jaspersoft.jasperserver.dto.executions;

/**
 * @author Vasyl Spachynskyi
 * @version $Id$
 * @since 16.01.2016
 */
public interface QueryExecutionsMediaType {
    String JSON = "+json";
    String XML = "+xml";
    String MEDIA_TYPE_PREFIX = "application/execution.";

    String PROVIDED_QUERY = "providedQuery";
    String MULTI_LEVEL_QUERY = "multiLevelQuery";
    String MULTI_AXIS_QUERY = "multiAxisQuery";
    String IC_QUERY = "icQuery"; // internal
    String DOMAIN_QUERY = "domainQuery";// internal

    String EXECUTION_MULTI_LEVEL_QUERY_JSON = MEDIA_TYPE_PREFIX + MULTI_LEVEL_QUERY + JSON;
    String EXECUTION_MULTI_AXIS_QUERY_JSON = MEDIA_TYPE_PREFIX + MULTI_AXIS_QUERY + JSON;
    String EXECUTION_PROVIDED_QUERY_JSON = MEDIA_TYPE_PREFIX + PROVIDED_QUERY + JSON;

    String EXECUTION_MULTI_LEVEL_QUERY_XML = MEDIA_TYPE_PREFIX + MULTI_LEVEL_QUERY + XML;
    String EXECUTION_MULTI_AXIS_QUERY_XML = MEDIA_TYPE_PREFIX + MULTI_AXIS_QUERY + XML;
    String EXECUTION_PROVIDED_QUERY_XML = MEDIA_TYPE_PREFIX + PROVIDED_QUERY + XML;

    String EXECUTION_IC_QUERY_JSON = MEDIA_TYPE_PREFIX + IC_QUERY + JSON;
    String EXECUTION_DOMAIN_QUERY_JSON = MEDIA_TYPE_PREFIX + DOMAIN_QUERY + JSON;

    String EXECUTION_IC_QUERY_XML = MEDIA_TYPE_PREFIX + IC_QUERY + XML;
    String EXECUTION_DOMAIN_QUERY_QUERY_XML = MEDIA_TYPE_PREFIX + DOMAIN_QUERY + XML;
}
