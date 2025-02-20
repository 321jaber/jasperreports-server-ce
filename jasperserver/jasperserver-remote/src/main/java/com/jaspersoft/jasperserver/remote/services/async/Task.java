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

package com.jaspersoft.jasperserver.remote.services.async;

import com.jaspersoft.jasperserver.dto.importexport.State;
import com.jaspersoft.jasperserver.remote.exception.NoResultException;
import com.jaspersoft.jasperserver.remote.exception.NotReadyResultException;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;

/*
*  @author inesterenko
*/
public interface Task<T> {

    String INPROGRESS = "inprogress";
    String FINISHED = "finished";
    String FAILED = "failed";
    String PENDING = "pending";

    void start(ExecutorService executor);

    void stop();

    String getUniqueId();

    void setUniqueId(String uuid);

    State getState();

    T getResult() throws NotReadyResultException, NoResultException;

    String getOrganizationId();

    String getBrokenDependenciesStrategy();

    Map<String, String> getParameters();

    void updateTask(Map<String, String> parameters, String organizationId, String brokenDependenciesStrategy);

    /**
     * Returns task completion date
     *
     * @return task completion date
     */
    Date getTaskCompletionDate();
}
