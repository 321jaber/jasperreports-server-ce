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

package com.jaspersoft.jasperserver.api.engine.scheduling.quartz;

import com.jaspersoft.jasperserver.api.engine.scheduling.domain.ReportJob;
import org.quartz.JobExecutionException;
import com.jaspersoft.jasperserver.api.JasperServerAPI;
import java.util.List;

/**
 * user can easily customize file saving feature by writing custom codes to implement ReportExecutionJobMailNotification interface
 * then plug it in applicationContext-report-scheduling.xml
 *
 * @author Ivan Chan (ichan@jaspersoft.com)
 * @version $Id$
 */
@JasperServerAPI
public interface ReportExecutionJobMailNotification {

    /*
     * users can plug in their custom codes to override the mail notification feature
     */
    public void sendMailNotification(ReportExecutionJob job, ReportJob jobDetails, List reportOutputs) throws JobExecutionException;

}
