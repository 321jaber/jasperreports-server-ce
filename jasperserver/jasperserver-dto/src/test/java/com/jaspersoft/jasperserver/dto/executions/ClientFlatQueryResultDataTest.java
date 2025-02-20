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

import com.jaspersoft.jasperserver.dto.adhoc.dataset.ClientFlatDataset;
import com.jaspersoft.jasperserver.dto.basetests.BaseDTOPresentableTest;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotSame;

/**
 * @author Andriy Tivodar <ativodar@tibco>
 */

public class ClientFlatQueryResultDataTest extends BaseDTOPresentableTest<ClientFlatQueryResultData> {

    @Override
    protected List<ClientFlatQueryResultData> prepareInstancesWithAlternativeParameters() {
        return Arrays.asList(
                createFullyConfiguredInstance().setTotalCounts(24),
                createFullyConfiguredInstance().setTruncated(false),
                createFullyConfiguredInstance().setQueryParams(new ClientQueryParams().setOffset(new int[]{5, 6})),
                createFullyConfiguredInstance().setDataSet(new ClientFlatDataset().setCounts(21)),
                // with null values
                createFullyConfiguredInstance().setTotalCounts(null),
                createFullyConfiguredInstance().setTruncated(null),
                createFullyConfiguredInstance().setQueryParams(null),
                createFullyConfiguredInstance().setDataSet(null)
        );
    }

    @Override
    protected ClientFlatQueryResultData createFullyConfiguredInstance() {
        ClientFlatQueryResultData clientFlatQueryResultData = new ClientFlatQueryResultData();
        clientFlatQueryResultData.setTotalCounts(23);
        clientFlatQueryResultData.setTruncated(true);
        clientFlatQueryResultData.setQueryParams(new ClientQueryParams().setOffset(new int[]{2, 3}));
        clientFlatQueryResultData.setDataSet(new ClientFlatDataset().setCounts(23));
        return clientFlatQueryResultData;
    }

    @Override
    protected ClientFlatQueryResultData createInstanceWithDefaultParameters() {
        return new ClientFlatQueryResultData();
    }

    @Override
    protected ClientFlatQueryResultData createInstanceFromOther(ClientFlatQueryResultData other) {
        return new ClientFlatQueryResultData(other);
    }

    @Override
    protected void assertFieldsHaveUniqueReferences(ClientFlatQueryResultData expected, ClientFlatQueryResultData actual) {
        assertNotSame(expected.getDataSet(), actual.getDataSet());
        assertNotSame(expected.getQueryParams(), actual.getQueryParams());
    }

    @Test
    public void instanceIsCreatedFromClientFlatDatasetParameter() {
        ClientFlatQueryResultData result = new ClientFlatQueryResultData(fullyConfiguredTestInstance.getDataSet());
        assertEquals(fullyConfiguredTestInstance.getDataSet(), result.getDataSet());
    }
}
