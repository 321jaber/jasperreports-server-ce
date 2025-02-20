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

package com.jaspersoft.jasperserver.api.engine.jasperreports.service.impl;

import java.sql.Connection;
import java.sql.Driver;
import java.sql.SQLException;
import java.util.Map;
import java.util.Properties;

import io.opentelemetry.extension.annotations.WithSpan;
import net.sf.jasperreports.data.jdbc.JdbcDataAdapter;
import net.sf.jasperreports.data.jdbc.JdbcDataAdapterService;
import net.sf.jasperreports.engine.JRRuntimeException;
import net.sf.jasperreports.engine.JasperReportsContext;
import net.sf.jasperreports.engine.ParameterContributorContext;
import net.sf.jasperreports.engine.util.JRClassLoader;

/**
 * Create JDBC connection from data adapter properties
 */
public class JDBCQueryDataSourceService extends JdbcDataAdapterService {

	public JDBCQueryDataSourceService(JasperReportsContext jasperReportsContext, JdbcDataAdapter jdbcDataAdapter)
	{
		super(new ParameterContributorContext(jasperReportsContext, null, null), jdbcDataAdapter);
	}

    @WithSpan
    public Connection getConnection() throws SQLException{
        JdbcDataAdapter jdbcDataAdapter = getJdbcDataAdapter();
        Connection connection;
        if (jdbcDataAdapter != null)
        {
            ClassLoader oldThreadClassLoader = Thread.currentThread().getContextClassLoader();

            try
            {
                Thread.currentThread().setContextClassLoader(getClassLoader(oldThreadClassLoader));

                Class<?> clazz = JRClassLoader.loadClassForRealName(jdbcDataAdapter.getDriver());
                Driver driver = (Driver) clazz.newInstance();

                Properties connectProps = new Properties();
                Map<String, String> map = jdbcDataAdapter.getProperties();
                if(map != null)
                    for(String key: map.keySet())
                        connectProps.setProperty(key, map.get(key));

                connectProps.setProperty("user", jdbcDataAdapter.getUsername());
                connectProps.setProperty("password", jdbcDataAdapter.getPassword());

                connection = driver.connect(jdbcDataAdapter.getUrl(), connectProps);
                if(connection == null)
                    throw new SQLException("No suitable driver found for "+ jdbcDataAdapter.getUrl());
            }
            catch (ClassNotFoundException ex){
                throw new JRRuntimeException(ex);
            } catch (InstantiationException e) {
                throw new JRRuntimeException(e);
            } catch (IllegalAccessException e) {
                throw new JRRuntimeException(e);
            } finally {
                Thread.currentThread().setContextClassLoader(oldThreadClassLoader);
            }
            return connection;
        }
        return null;
    }

}
