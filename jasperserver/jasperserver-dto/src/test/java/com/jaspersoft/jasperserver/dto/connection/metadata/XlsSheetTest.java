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

package com.jaspersoft.jasperserver.dto.connection.metadata;

import com.jaspersoft.jasperserver.dto.basetests.BaseDTOPresentableTest;

import java.util.Arrays;
import java.util.List;

/**
 * @author Olexandr Dahno <odahno@tibco.com>
 */

public class XlsSheetTest extends BaseDTOPresentableTest<XlsSheet> {

    private static final String TEST_NAME = "TEST_NAME";
    private static final String TEST_NAME_1 = "TEST_NAME_1";

    private static final List<String> TEST_COLUMNS = Arrays.asList("TEST_COLUMN_A", "TEST_COLUMN_B");
    private static final List<String> TEST_COLUMNS_1 = Arrays.asList("TEST_COLUMN_A_1", "TEST_COLUMN_B_1");

    @Override
    protected List<XlsSheet> prepareInstancesWithAlternativeParameters() {
        return Arrays.asList(
                createFullyConfiguredInstance().setName(TEST_NAME_1),
                createFullyConfiguredInstance().setColumns(TEST_COLUMNS_1)
        );
    }

    @Override
    protected XlsSheet createFullyConfiguredInstance() {
        return createInstanceWithDefaultParameters()
                .setName(TEST_NAME)
                .setColumns(TEST_COLUMNS);
    }

    @Override
    protected XlsSheet createInstanceWithDefaultParameters() {
        return new XlsSheet();
    }

    @Override
    protected XlsSheet createInstanceFromOther(XlsSheet other) {
        return new XlsSheet(other);
    }

}
