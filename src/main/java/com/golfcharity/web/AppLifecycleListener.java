package com.golfcharity.web;

import com.golfcharity.config.Database;
import com.mysql.cj.jdbc.AbandonedConnectionCleanupThread;

import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

@WebListener
public class AppLifecycleListener implements ServletContextListener {
    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        Database.deregisterDriver();
        AbandonedConnectionCleanupThread.checkedShutdown();
    }
}
