import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useAuth} from '../../context/AuthContext';
import {useApp} from '../../context/AppContext';
import Colors from '../../utils/colors';
import moment from 'moment';

const ProfileAvatar = ({name}) => {
  const initials = name
    ? name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'MJ';

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark]}
      style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </LinearGradient>
  );
};

const StorageBar = ({used, total}) => {
  const percent = Math.min((used / total) * 100, 100);
  const barColor =
    percent > 80
      ? Colors.danger
      : percent > 60
      ? Colors.warning
      : Colors.success;

  return (
    <View style={styles.storageContainer}>
      <View style={styles.storageBarBg}>
        <View
          style={[
            styles.storageBarFill,
            {width: `${percent}%`, backgroundColor: barColor},
          ]}
        />
      </View>
      <View style={styles.storageInfo}>
        <Text style={styles.storageText}>
          {used} GB dari {total} GB terpakai
        </Text>
        <Text style={[styles.storagePercent, {color: barColor}]}>
          {percent.toFixed(0)}%
        </Text>
      </View>
    </View>
  );
};

const MenuItem = ({icon, label, subtitle, value, onPress, isSwitch, switchValue, onSwitchChange, color, isDestructive, showBadge, badgeCount}) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={isSwitch ? undefined : onPress}
    activeOpacity={isSwitch ? 1 : 0.7}>
    <View
      style={[
        styles.menuIconBg,
        {backgroundColor: (isDestructive ? Colors.danger : color || Colors.primary) + '22'},
      ]}>
      <Icon
        name={icon}
        size={18}
        color={isDestructive ? Colors.danger : color || Colors.primary}
      />
    </View>
    <View style={styles.menuContent}>
      <Text
        style={[
          styles.menuLabel,
          isDestructive && {color: Colors.danger},
        ]}>
        {label}
      </Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    <View style={styles.menuRight}>
      {value && <Text style={styles.menuValue}>{value}</Text>}
      {showBadge && badgeCount > 0 && (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{badgeCount}</Text>
        </View>
      )}
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{false: Colors.border, true: Colors.primary + '66'}}
          thumbColor={switchValue ? Colors.primary : Colors.textMuted}
          ios_backgroundColor={Colors.border}
        />
      ) : (
        <Icon name="chevron-right" size={18} color={Colors.textMuted} />
      )}
    </View>
  </TouchableOpacity>
);

const SectionTitle = ({title}) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const ProfileScreen = () => {
  const {user, logout} = useAuth();
  const {cameras, alerts, onlineCamerasCount} = useApp();

  const [notifMotion, setNotifMotion] = useState(true);
  const [notifOffline, setNotifOffline] = useState(true);
  const [notifBattery, setNotifBattery] = useState(true);
  const [notifSound, setNotifSound] = useState(true);
  const [notifVibrate, setNotifVibrate] = useState(true);

  const handleLogout = () => {
    Alert.alert('Keluar', 'Yakin ingin keluar dari akun ini?', [
      {text: 'Batal', style: 'cancel'},
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  const handleChangePassword = () => {
    Alert.alert('Ganti Password', 'Fitur ini akan segera tersedia.');
  };

  const handle2FA = () => {
    Alert.alert('Autentikasi 2 Faktor', 'Fitur ini akan segera tersedia.');
  };

  const totalRecordings = 27;
  const daysActive = moment().diff(moment(user?.joinDate), 'days');
  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[Colors.background, Colors.surface]}
          style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileCardTop}>
              <ProfileAvatar name={user?.name} />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                <View style={styles.planBadge}>
                  <Icon name="star" size={12} color={Colors.warning} />
                  <Text style={styles.planText}>
                    {user?.plan || 'Basic'} Plan
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.editBtn}>
                <Icon name="pencil-outline" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Plan Expiry */}
            <View style={styles.planExpiry}>
              <Icon name="calendar-check" size={14} color={Colors.textMuted} />
              <Text style={styles.planExpiryText}>
                Berakhir:{' '}
                {moment(user?.planExpiry).format('DD MMMM YYYY')}
              </Text>
              <TouchableOpacity style={styles.renewBtn}>
                <Text style={styles.renewBtnText}>Perpanjang</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Icon name="cctv" size={22} color={Colors.primary} />
            <Text style={styles.statValue}>{cameras.length}</Text>
            <Text style={styles.statLabel}>Kamera</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Icon name="wifi" size={22} color={Colors.success} />
            <Text style={styles.statValue}>{onlineCamerasCount}</Text>
            <Text style={styles.statLabel}>Online</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Icon name="video" size={22} color={Colors.warning} />
            <Text style={styles.statValue}>{totalRecordings}</Text>
            <Text style={styles.statLabel}>Rekaman</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Icon name="calendar" size={22} color={Colors.info} />
            <Text style={styles.statValue}>{daysActive}</Text>
            <Text style={styles.statLabel}>Hari Aktif</Text>
          </View>
        </View>

        {/* Cloud Storage */}
        <View style={styles.section}>
          <View style={styles.storageCard}>
            <View style={styles.storageHeader}>
              <View style={styles.storageIconBg}>
                <Icon name="cloud" size={22} color={Colors.primary} />
              </View>
              <View style={styles.storageTextSection}>
                <Text style={styles.storageTitle}>Penyimpanan Cloud</Text>
                <Text style={styles.storageSubtitle}>
                  {user?.storageUsed} GB / {user?.storageTotal} GB
                </Text>
              </View>
              <TouchableOpacity style={styles.upgradeBtn}>
                <Text style={styles.upgradeBtnText}>Upgrade</Text>
              </TouchableOpacity>
            </View>
            <StorageBar
              used={user?.storageUsed || 68}
              total={user?.storageTotal || 100}
            />
          </View>
        </View>

        {/* Account Security */}
        <View style={styles.section}>
          <SectionTitle title="Keamanan Akun" />
          <View style={styles.menuCard}>
            <MenuItem
              icon="two-factor-authentication"
              label="Autentikasi 2 Faktor"
              subtitle={user?.twoFactorEnabled ? 'Aktif' : 'Nonaktif'}
              color={Colors.success}
              value={user?.twoFactorEnabled ? 'Aktif' : 'Nonaktif'}
              onPress={handle2FA}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="fingerprint"
              label="Login Biometrik"
              subtitle="Sidik jari / Face ID"
              color={Colors.primary}
              isSwitch
              switchValue={user?.biometricEnabled}
              onSwitchChange={() => {}}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="lock-reset"
              label="Ganti Password"
              color={Colors.warning}
              onPress={handleChangePassword}
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <SectionTitle title="Notifikasi" />
          <View style={styles.menuCard}>
            <MenuItem
              icon="run-fast"
              label="Deteksi Gerakan"
              color={Colors.warning}
              isSwitch
              switchValue={notifMotion}
              onSwitchChange={setNotifMotion}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="wifi-off"
              label="Kamera Offline"
              color={Colors.danger}
              isSwitch
              switchValue={notifOffline}
              onSwitchChange={setNotifOffline}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="battery-alert"
              label="Baterai Kritis"
              color={Colors.danger}
              isSwitch
              switchValue={notifBattery}
              onSwitchChange={setNotifBattery}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="volume-high"
              label="Suara Notifikasi"
              color={Colors.info}
              isSwitch
              switchValue={notifSound}
              onSwitchChange={setNotifSound}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="vibrate"
              label="Getar"
              color={Colors.info}
              isSwitch
              switchValue={notifVibrate}
              onSwitchChange={setNotifVibrate}
            />
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <SectionTitle title="Aplikasi" />
          <View style={styles.menuCard}>
            <MenuItem
              icon="translate"
              label="Bahasa"
              value="Indonesia"
              color={Colors.primary}
              onPress={() => {}}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="theme-light-dark"
              label="Tema"
              value="Gelap"
              color={Colors.info}
              onPress={() => {}}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="video-settings"
              label="Kualitas Stream Default"
              value="HD"
              color={Colors.success}
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Help */}
        <View style={styles.section}>
          <SectionTitle title="Bantuan" />
          <View style={styles.menuCard}>
            <MenuItem
              icon="help-circle-outline"
              label="Pusat Bantuan"
              color={Colors.info}
              onPress={() => {}}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="message-question-outline"
              label="Hubungi Dukungan"
              color={Colors.primary}
              onPress={() => {}}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="star-outline"
              label="Beri Penilaian"
              color={Colors.warning}
              onPress={() => {}}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="information-outline"
              label="Versi Aplikasi"
              value="1.0.0"
              color={Colors.textMuted}
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Logout */}
        <View style={[styles.section, styles.lastSection]}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" size={20} color={Colors.danger} />
            <Text style={styles.logoutText}>Keluar</Text>
          </TouchableOpacity>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  profileEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    backgroundColor: Colors.warning + '22',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  planText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.warning,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary + '22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planExpiry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  planExpiryText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  renewBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.primary + '22',
  },
  renewBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  statsSection: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  lastSection: {
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  menuCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuValue: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  menuBadge: {
    backgroundColor: Colors.danger,
    borderRadius: 8,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  menuBadgeText: {
    color: Colors.textWhite,
    fontSize: 10,
    fontWeight: '700',
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: 14,
  },
  storageCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  storageIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary + '22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storageTextSection: {
    flex: 1,
  },
  storageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  storageSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  upgradeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: Colors.primary + '22',
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  upgradeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  storageContainer: {
    gap: 6,
  },
  storageBarBg: {
    height: 8,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  storageBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  storageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  storageText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  storagePercent: {
    fontSize: 12,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.danger + '11',
    borderWidth: 1,
    borderColor: Colors.danger + '33',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.danger,
  },
});

export default ProfileScreen;
