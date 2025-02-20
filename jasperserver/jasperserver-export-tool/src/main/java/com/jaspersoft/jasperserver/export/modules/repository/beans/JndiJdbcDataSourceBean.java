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
package com.jaspersoft.jasperserver.export.modules.repository.beans;

import com.jaspersoft.jasperserver.api.JSException;
import com.jaspersoft.jasperserver.api.common.util.JndiUtils;
import com.jaspersoft.jasperserver.api.metadata.common.domain.Resource;
import com.jaspersoft.jasperserver.api.metadata.jasperreports.domain.JndiJdbcReportDataSource;
import com.jaspersoft.jasperserver.export.modules.repository.ResourceExportHandler;
import com.jaspersoft.jasperserver.export.modules.repository.ResourceImportHandler;

import javax.naming.InvalidNameException;
import java.text.MessageFormat;

/**
 * @author tkavanagh
 * @version $Id$
 */
public class JndiJdbcDataSourceBean extends ResourceBean {

	private String jndiName;
	private String timezone;

	protected void additionalCopyFrom(Resource res, ResourceExportHandler referenceHandler) {
		JndiJdbcReportDataSource ds = (JndiJdbcReportDataSource) res;
		setJndiName(ds.getJndiName());
		setTimezone(ds.getTimezone());
	}

	protected void additionalCopyTo(Resource res, ResourceImportHandler importHandler) {
		JndiJdbcReportDataSource ds = (JndiJdbcReportDataSource) res;
		try {
			JndiUtils.validateName(getJndiName());
			ds.setJndiName(getJndiName());
		} catch (InvalidNameException e) {
			throw new JSException(MessageFormat.format("The JNDI service name \"{0}\" is invalid.", getJndiName()), e);
		}
		ds.setTimezone(getTimezone());
	}

	public String getJndiName() {
		return jndiName;
	}

	public void setJndiName(String jndiName) {
		this.jndiName = jndiName;
	}

	public String getTimezone() {
		return timezone;
	}

	public void setTimezone(String timezone) {
		this.timezone = timezone;
	}	

}
