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
package com.jaspersoft.jasperserver.test;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * MySmartBean class
 *
 * @author Steve Rosen
 */
public class MySmartBean {
    protected final static Log m_logger = LogFactory.getLog(MySmartBean.class);
    private String m_name;

    /**
     * MySmartBean
     */
    public MySmartBean() {
        m_logger.info("MySmartBean() is being created...");
    }

    /**
     * setBeanName
     * 
     * sets the name of this MySmartBean object
     */
    public void setBeanName(String name) {
        m_logger.info("setBeanName() name = " + name);
        m_name = name;
        return;
    }

    /**
     * getBeanName
     *
     * gets the name of this MySmartBean object
     *
     * @return  the name
     */
    public String getBeanName() {
        return m_name;
    }

    /**
     * toString
     * 
     * Used to print out the name of this MySmartBean for debugging purposes
     * 
     * @return  the String
     */
    public String toString() {
        return m_name;
    }
}
