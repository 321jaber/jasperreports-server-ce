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

package com.jaspersoft.jasperserver.api.metadata.common.service.impl;

import java.util.Iterator;
import java.util.List;
import org.hibernate.event.spi.PostUpdateEvent;
import org.hibernate.event.spi.PostUpdateEventListener;
import org.hibernate.persister.entity.EntityPersister;

/**
 *
 * @author swood
 */
public class HibernateCompositePostUpdateListener implements PostUpdateEventListener {

    private List listeners;

    public List getListeners() {
        return listeners;
    }

    public void setListeners(List listeners) {
        this.listeners = listeners;
    }

    public void onPostUpdate(final PostUpdateEvent event) {
        visitListeners(new ListenerVisitor() {
            public void visit(PostUpdateEventListener listener) {
                listener.onPostUpdate(event);
            }
        });
    }

    @Override
    public boolean requiresPostCommitHanding(EntityPersister persister) {
        return false;
    }

    protected static interface ListenerVisitor {
        void visit(PostUpdateEventListener listener);
    }

    protected void visitListeners(ListenerVisitor visitor) {
        if (listeners != null && !listeners.isEmpty()) {
            for (Iterator it = listeners.iterator(); it.hasNext();) {
                PostUpdateEventListener listener = (PostUpdateEventListener) it.next();
                visitor.visit(listener);
            }
        }
    }

}
