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
package com.jaspersoft.jasperserver.jaxrs.report;

import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;
import javax.xml.bind.annotation.XmlValue;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * @author Yaroslav.Kovalchyk
 * @version $Id: ReportExecutionStatusEntity.java 26599 2012-12-10 13:04:23Z ykovalchyk $
 */
@XmlRootElement(name = "status")
public class ReportExecutionStatusEntity {
    public static final String VALUE_CANCELLED = "cancelled";

    private String value = VALUE_CANCELLED;
    private boolean asyncCancel = false;

    @XmlValue
    @Schema(description = "The status of the report execution", example = "cancelled")
    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public boolean getAsyncCancel() {
        return asyncCancel;
    }

    public void setAsyncCancel(boolean asyncCancel) {
        this.asyncCancel = asyncCancel;
    }
}
