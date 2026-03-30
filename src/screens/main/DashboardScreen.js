import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  RefreshControl,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {LineChart} from 'react-native-chart-kit';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import {useApp} from '../../context/AppContext';
import Colors from '../../utils/colors';
import {mockActivityData} from '../../utils/mockData';
import moment from 'moment';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const StatCard = ({icon, label, value, color, bgColor}) => (
  <View style={[styles.statCard, {backgroundColor: bgColor}]}>
    <View style={[styles.statIconContainer, {backgroundColor: color + '22'}]}>
      <Icon name={icon} size={22} color={color} />
    </View>
    <Text style={[styles.statValue, {color}]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const QuickAction = ({icon, label, isActive, color, onPress}) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
    <LinearGradient
      colors={isActive ? [color + 'DD', color + '99'] : [Colors.surface, Colors.backgroundLight]}
      style={[
        styles.quickActionGradient,
        isActive && {borderColor: color, borderWidth: 1},
      ]}>
      <Icon name={icon} size={26} color={isActive ? Colors.textWhite : color} />
    </LinearGradient>
    <Text style={[styles.quickActionLabel, isActive && {color: color}]}>{label}</Text>
  </TouchableOpacity>
);

const CameraPreviewCard = ({camera, onPress}) => {
  const statusColor = camera.status === 'online' ? Colors.live : Colors.offline;
  return (
    <TouchableOpacity style={styles.cameraCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cameraPreview}>
        <View style={styles.cameraPlaceholder}>
          <Icon name="cctv" size={32} color={Colors.textMuted} />
        </View>
        <View style={styles.cameraOverlay}>
          {camera.isLive && camera.status === 'online' && (
            <View style={styles.liveBadge}>
              <View style={styles.liveIndicator} />
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
          )}
          {camera.isRecording && (
            <View style={styles.recBadge}>
              <Icon name="record" size={10} color={Colors.textWhite} />
              <Text style={styles.recBadgeText}>REC</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.cameraInfo}>
        <View style={styles.cameraStatusDot}>
          <View style={[styles.statusDot, {backgroundColor: statusColor}]} />
          <Text style={styles.cameraName} numberOfLines={1}>{camera.name}</Text>
        </View>
        <Text style={styles.cameraLocation} numberOfLines={1}>{camera.location}</Text>
      </View>
    </TouchableOpacity>
  );
};

const AlertRow = ({alert}) => {
  const severityColor =
    alert.severity === 'high'
      ? Colors.severityHigh
      : alert.severity === 'medium'
      ? Colors.severityMedium
      : Colors.severityLow;

  const iconName =
    alert.type === 'motion'
      ? 'run-fast'
      : alert.type === 'battery'
      ? 'battery-alert'
      : alert.type === 'offline'
      ? 'wifi-off'
      : 'bell-alert';

  return (
    <View style={[styles.alertRow, !alert.isRead && styles.alertRowUnread]}>
      <View style={[styles.alertIcon, {backgroundColor: severityColor + '22'}]}>
        <Icon name={iconName} size={18} color={severityColor} />
      </View>
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle} numberOfLines={1}>
          {alert.title}
        </Text>
        <Text style={styles.alertMeta}>
          {alert.cameraName} · {moment(alert.timestamp).fromNow()}
        </Text>
      </View>
      {!alert.isRead && <View style={styles.unreadDot} />}
    </View>
  );
};

const DashboardScreen = () => {
  const navigation = useNavigation();
  const {user} = useAuth();
  const {
    cameras,
    isArmed,
    doorLocked,
    lightOn,
    gateOpen,
    onlineCamerasCount,
    offlineCamerasCount,
    recordingCamerasCount,
    toggleArmed,
    toggleDoorLock,
    toggleLight,
    toggleGate,
    getRecentAlerts,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const recentAlerts = getRecentAlerts(4);
  const previewCameras = cameras.slice(0, 4);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam';

  const navigateToCameraDetail = camera => {
    navigation.navigate('CameraDetail', {cameraId: camera.id});
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greetingText}>{greeting},</Text>
            <Text style={styles.userName}>
              {user?.name?.split(' ')[0] || 'Pengguna'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn}>
              <Icon name="magnify" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn}>
              <Icon name="bell-outline" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Security Status Banner */}
        <TouchableOpacity
          onPress={toggleArmed}
          activeOpacity={0.8}
          style={styles.securityBanner}>
          <LinearGradient
            colors={isArmed ? ['#1A3A2A', '#0F2418'] : ['#3A1A1A', '#240F0F']}
            style={styles.securityBannerGradient}>
            <View style={styles.securityBannerLeft}>
              <View
                style={[
                  styles.securityIconBg,
                  {backgroundColor: isArmed ? Colors.success + '33' : Colors.danger + '33'},
                ]}>
                <Icon
                  name={isArmed ? 'shield-check' : 'shield-off'}
                  size={28}
                  color={isArmed ? Colors.success : Colors.danger}
                />
              </View>
              <View>
                <Text style={styles.securityStatus}>
                  {isArmed ? 'Sistem Aktif' : 'Sistem Nonaktif'}
                </Text>
                <Text style={styles.securitySubtext}>
                  {isArmed
                    ? 'Semua sensor terpantau'
                    : 'Ketuk untuk mengaktifkan'}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.securityBadge,
                {backgroundColor: isArmed ? Colors.success : Colors.danger},
              ]}>
              <Text style={styles.securityBadgeText}>
                {isArmed ? 'AMAN' : 'OFF'}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Kamera</Text>
          <View style={styles.statsRow}>
            <StatCard
              icon="cctv"
              label="Total"
              value={cameras.length}
              color={Colors.info}
              bgColor={Colors.backgroundCard}
            />
            <StatCard
              icon="wifi"
              label="Online"
              value={onlineCamerasCount}
              color={Colors.success}
              bgColor={Colors.backgroundCard}
            />
            <StatCard
              icon="record-circle"
              label="Merekam"
              value={recordingCamerasCount}
              color={Colors.danger}
              bgColor={Colors.backgroundCard}
            />
            <StatCard
              icon="wifi-off"
              label="Offline"
              value={offlineCamerasCount}
              color={Colors.textMuted}
              bgColor={Colors.backgroundCard}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aksi Cepat</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              icon={isArmed ? 'shield-check' : 'shield-off-outline'}
              label="Mode Siaga"
              isActive={isArmed}
              color={Colors.success}
              onPress={toggleArmed}
            />
            <QuickAction
              icon={doorLocked ? 'door-closed-lock' : 'door-open'}
              label={doorLocked ? 'Terkunci' : 'Buka Kunci'}
              isActive={doorLocked}
              color={Colors.warning}
              onPress={toggleDoorLock}
            />
            <QuickAction
              icon={lightOn ? 'lightbulb-on' : 'lightbulb-outline'}
              label="Lampu"
              isActive={lightOn}
              color={Colors.warning}
              onPress={toggleLight}
            />
            <QuickAction
              icon={gateOpen ? 'gate-open' : 'gate'}
              label={gateOpen ? 'Buka' : 'Tutup'}
              isActive={gateOpen}
              color={Colors.info}
              onPress={toggleGate}
            />
          </View>
        </View>

        {/* Camera Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Preview Kamera</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Cameras')}>
              <Text style={styles.seeAllText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cameraGrid}>
            {previewCameras.map(camera => (
              <CameraPreviewCard
                key={camera.id}
                camera={camera}
                onPress={() => navigateToCameraDetail(camera)}
              />
            ))}
          </View>
        </View>

        {/* Activity Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aktivitas 7 Hari Terakhir</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={mockActivityData}
              width={SCREEN_WIDTH - 48}
              height={180}
              chartConfig={{
                backgroundColor: Colors.backgroundCard,
                backgroundGradientFrom: Colors.backgroundCard,
                backgroundGradientTo: Colors.backgroundCard,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(26, 115, 232, ${opacity})`,
                labelColor: (opacity = 1) =>
                  `rgba(148, 163, 184, ${opacity})`,
                style: {borderRadius: 16},
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: Colors.primary,
                },
                propsForBackgroundLines: {
                  stroke: Colors.border,
                  strokeDasharray: '4',
                },
              }}
              bezier
              style={styles.chart}
              withShadow={false}
            />
          </View>
        </View>

        {/* Recent Alerts */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Peringatan Terbaru</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Alerts')}>
              <Text style={styles.seeAllText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.alertsContainer}>
            {recentAlerts.length > 0 ? (
              recentAlerts.map(alert => (
                <AlertRow key={alert.id} alert={alert} />
              ))
            ) : (
              <View style={styles.emptyAlerts}>
                <Icon
                  name="bell-check-outline"
                  size={32}
                  color={Colors.textMuted}
                />
                <Text style={styles.emptyAlertsText}>
                  Tidak ada peringatan
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  securityBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  securityBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  securityBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  securityIconBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityStatus: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  securitySubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  securityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  securityBadgeText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  lastSection: {
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  seeAllText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  quickActionGradient: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  cameraGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cameraCard: {
    width: (SCREEN_WIDTH - 50) / 2,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cameraPreview: {
    height: 100,
    backgroundColor: Colors.surface,
    position: 'relative',
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    gap: 4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + 'DD',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textWhite,
  },
  liveBadgeText: {
    color: Colors.textWhite,
    fontSize: 9,
    fontWeight: '700',
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger + 'DD',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  recBadgeText: {
    color: Colors.textWhite,
    fontSize: 9,
    fontWeight: '700',
  },
  cameraInfo: {
    padding: 10,
  },
  cameraStatusDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  cameraName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  cameraLocation: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chartContainer: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chart: {
    borderRadius: 16,
  },
  alertsContainer: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  alertRowUnread: {
    backgroundColor: Colors.primary + '0A',
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  alertMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  emptyAlerts: {
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  emptyAlertsText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});

export default DashboardScreen;
