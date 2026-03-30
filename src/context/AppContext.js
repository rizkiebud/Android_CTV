import React, {createContext, useContext, useState, useCallback} from 'react';
import {mockCameras, mockAlerts, mockSystemStatus} from '../utils/mockData';

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({children}) => {
  const [cameras, setCameras] = useState(mockCameras);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [systemStatus, setSystemStatus] = useState(mockSystemStatus);
  const [isArmed, setIsArmed] = useState(mockSystemStatus.isArmed);
  const [doorLocked, setDoorLocked] = useState(mockSystemStatus.doorLocked);
  const [lightOn, setLightOn] = useState(mockSystemStatus.lightOn);
  const [gateOpen, setGateOpen] = useState(mockSystemStatus.gateOpen);

  const unreadAlertsCount = alerts.filter(a => !a.isRead).length;

  const onlineCamerasCount = cameras.filter(c => c.status === 'online').length;
  const offlineCamerasCount = cameras.filter(c => c.status === 'offline').length;
  const recordingCamerasCount = cameras.filter(
    c => c.isRecording && c.status === 'online',
  ).length;

  const toggleArmed = useCallback(() => {
    setIsArmed(prev => !prev);
  }, []);

  const toggleDoorLock = useCallback(() => {
    setDoorLocked(prev => !prev);
  }, []);

  const toggleLight = useCallback(() => {
    setLightOn(prev => !prev);
  }, []);

  const toggleGate = useCallback(() => {
    setGateOpen(prev => !prev);
  }, []);

  const markAlertRead = useCallback(alertId => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? {...a, isRead: true} : a)),
    );
  }, []);

  const markAllAlertsRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({...a, isRead: true})));
  }, []);

  const deleteAlert = useCallback(alertId => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const updateCamera = useCallback((cameraId, updates) => {
    setCameras(prev =>
      prev.map(c => (c.id === cameraId ? {...c, ...updates} : c)),
    );
  }, []);

  const getCameraById = useCallback(
    cameraId => {
      return cameras.find(c => c.id === cameraId);
    },
    [cameras],
  );

  const getRecentAlerts = useCallback(
    (limit = 5) => {
      return [...alerts]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    },
    [alerts],
  );

  return (
    <AppContext.Provider
      value={{
        cameras,
        alerts,
        systemStatus,
        isArmed,
        doorLocked,
        lightOn,
        gateOpen,
        unreadAlertsCount,
        onlineCamerasCount,
        offlineCamerasCount,
        recordingCamerasCount,
        toggleArmed,
        toggleDoorLock,
        toggleLight,
        toggleGate,
        markAlertRead,
        markAllAlertsRead,
        deleteAlert,
        clearAllAlerts,
        updateCamera,
        getCameraById,
        getRecentAlerts,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
