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
package com.jaspersoft.jasperserver.war.util;

import org.apache.commons.lang.exception.ExceptionUtils;

/**
 * @author Lucian Chirita (lucianc@users.sourceforge.net)
 * @version $Id$
 */
public class JSExceptionUtils {

	@SuppressWarnings("unchecked")
	public static <E extends Throwable> E extractCause(Throwable exception, Class<E> exceptionType) {
	    int index = ExceptionUtils.indexOfThrowable(exception, exceptionType);
	    E e;
	    if (index >= 0) {
	        e = (E) ExceptionUtils.getThrowableList(exception).get(index);
	    } else {
	    	e = null;
	    }
	    return e;
	}
	
}
