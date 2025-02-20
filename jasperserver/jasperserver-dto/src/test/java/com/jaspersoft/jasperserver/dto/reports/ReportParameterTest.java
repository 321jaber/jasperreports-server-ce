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

package com.jaspersoft.jasperserver.dto.reports;

import com.jaspersoft.jasperserver.dto.basetests.BaseDTOPresentableTest;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * <p></p>
 *
 * @author Zakhar.Tomchenco
 * @version $Id$
 */
public class ReportParameterTest extends BaseDTOPresentableTest<ReportParameter> {

    private static final String TEST_NAME = "TEST_NAME";
    private static final String TEST_LIMIT = "TEST_LIMIT";
    private static final String TEST_SELECT = "TEST_SELECT";
    private static final String TEST_OFFSET = "TEST_OFFSET";
    private static final String TEST_CRITERIA = "TEST_CRITERIA";
    private static final String TEST_NAME_1 = "TEST_NAME_1";
    private static final String TEST_LIMIT_1 = "TEST_LIMIT_1";
    private static final String TEST_SELECT_1 = "TEST_SELECT_1";
    private static final String TEST_OFFSET_1 = "TEST_OFFSET_1";
    private static final String TEST_CRITERIA_1 = "TEST_CRITERIA_1";

    private static final List<String> TEST_VALUES = Arrays.asList("TEST_VALUE_A", "TEST_VALUE_B");
    private static final List<String> TEST_VALUES_1 = Arrays.asList("TEST_VALUE_A_1", "TEST_VALUE_B_1");
    private static final List<String> TEST_VALUES_EMPTY = new ArrayList<String>();

    /*
     * BaseDTOPresentableTests
     */

    @Override
    protected List<ReportParameter> prepareInstancesWithAlternativeParameters() {
        return Arrays.asList(
                createFullyConfiguredInstance().setName(TEST_NAME_1),
                createFullyConfiguredInstance().setLimit(TEST_LIMIT_1),
                createFullyConfiguredInstance().setSelect(TEST_SELECT_1),
                createFullyConfiguredInstance().setOffset(TEST_OFFSET_1),
                createFullyConfiguredInstance().setCriteria(TEST_CRITERIA_1),
                createFullyConfiguredInstance().setValues(TEST_VALUES_1),
                createFullyConfiguredInstance().setValues(TEST_VALUES_EMPTY),
                // null values
                createFullyConfiguredInstance().setName(null),
                createFullyConfiguredInstance().setLimit(null),
                createFullyConfiguredInstance().setSelect(null),
                createFullyConfiguredInstance().setOffset(null),
                createFullyConfiguredInstance().setCriteria(null),
                createFullyConfiguredInstance().setValues(null)
        );
    }

    @Override
    protected ReportParameter createFullyConfiguredInstance() {
        return createInstanceWithDefaultParameters()
                .setName(TEST_NAME)
                .setLimit(TEST_LIMIT)
                .setSelect(TEST_SELECT)
                .setOffset(TEST_OFFSET)
                .setCriteria(TEST_CRITERIA)
                .setValues(TEST_VALUES);
    }

    @Override
    protected ReportParameter createInstanceWithDefaultParameters() {
        return new ReportParameter();
    }

    @Override
    protected ReportParameter createInstanceFromOther(ReportParameter other) {
        return new ReportParameter(other);
    }

}
