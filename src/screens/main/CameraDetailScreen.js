import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ScrollView,
  Switch,
  Animated,
  FlatList,
  Alert,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useApp} from '../../context/AppContext';
import Colors from '../../utils/colors';
import {mockRecordings} from '../../utils/mockData';
import moment from 'moment';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const PLAYER_HEIGHT = SCREEN_WIDTH * (9 / 16);

const TABS = [
  {id: 'live', label: 'Live', icon: 'play-circle'},
  {id: 'recordings', label: 'Rekaman', icon: 'video'},
  {id: 'settings', label: 'Pengaturan', icon: 'cog'},
  {id: 'info', label: 'Info', icon: 'information'},
];

// ─── Live Tab ─────────────────────────────────────────────────────────────────
const LiveTab = ({camera, onUpdate}) => {
  const [isMuted, setIsMuted] = useState(!camera.audioEnabled);
  const [isRecording, setIsRecording] = useState(camera.isRecording);
  const [zoom, setZoom] = useState(camera.zoom || 1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsAnim = useRef(new Animated.Value(1)).current;

  const fadeControls = show => {
    Animated.timing(controlsAnim, {
      toValue: show ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowControls(show);
  };

  const handlePTZ = direction => {
    // PTZ simulation
    const panMap = {left: -15, right: 15};
    const tiltMap = {up: -15, down: 15};
    if (direction in panMap) {
      onUpdate({pan: (camera.pan + panMap[direction] + 360) % 360});
    } else if (direction in tiltMap) {
      onUpdate({tilt: Math.max(-90, Math.min(90, camera.tilt + tiltMap[direction]))});
    }
  };

  const handleSnapshot = () => {
    Alert.alert('Snapshot', 'Foto berhasil disimpan ke galeri', [{text: 'OK'}]);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Live view: ${camera.name} - ${camera.location}`,
      });
    } catch {}
  };

  const toggleRecord = () => {
    setIsRecording(prev => {
      onUpdate({isRecording: !prev});
      return !prev;
    });
  };

  return (
    <View style={styles.liveContainer}>
      {/* Video Player */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => fadeControls(!showControls)}
        style={styles.playerContainer}>
        <View style={styles.playerBg}>
          <Icon name="cctv" size={48} color={Colors.textMuted} />
          <Text style={styles.playerPlaceholderText}>
            {camera.status === 'offline'
              ? 'Kamera Offline'
              : 'Live Stream Aktif'}
          </Text>
        </View>

        {/* HUD Overlay */}
        <Animated.View style={[styles.hudOverlay, {opacity: controlsAnim}]}>
          {/* Top HUD */}
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent']}
            style={styles.hudTop}>
            <View style={styles.hudTopLeft}>
              {camera.status === 'online' && (
                <View style={styles.hudLiveBadge}>
                  <View style={styles.hudLiveIndicator} />
                  <Text style={styles.hudLiveText}>LIVE</Text>
                </View>
              )}
              <Text style={styles.hudTime}>{moment().format('HH:mm:ss')}</Text>
            </View>
            <View style={styles.hudTopRight}>
              <Icon name="shield-check" size={14} color={Colors.success} />
              <Text style={styles.hudResText}>{camera.resolution?.split(' ')[0] || 'HD'}</Text>
            </View>
          </LinearGradient>

          {/* Camera Name */}
          <Text style={styles.hudCameraName}>{camera.name}</Text>

          {/* Bottom HUD Controls */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.hudBottom}>
            {/* Action Buttons */}
            <View style={styles.hudActions}>
              <TouchableOpacity
                style={[styles.hudBtn, isMuted && styles.hudBtnActive]}
                onPress={() => setIsMuted(prev => !prev)}>
                <Icon
                  name={isMuted ? 'volume-off' : 'volume-high'}
                  size={18}
                  color={Colors.textWhite}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.hudBtn, isRecording && styles.hudBtnRecord]}
                onPress={toggleRecord}>
                <Icon
                  name={isRecording ? 'record' : 'record-circle-outline'}
                  size={18}
                  color={isRecording ? Colors.danger : Colors.textWhite}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.hudBtn}
                onPress={handleSnapshot}>
                <Icon name="camera" size={18} color={Colors.textWhite} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.hudBtn} onPress={handleShare}>
                <Icon name="share-variant" size={18} color={Colors.textWhite} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.hudBtn}
                onPress={() => setIsFullscreen(prev => !prev)}>
                <Icon
                  name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'}
                  size={18}
                  color={Colors.textWhite}
                />
              </TouchableOpacity>
            </View>

            {/* Zoom Slider */}
            <View style={styles.zoomContainer}>
              <Icon name="magnify-minus" size={16} color={Colors.textSecondary} />
              <Slider
                style={styles.zoomSlider}
                minimumValue={1}
                maximumValue={8}
                value={zoom}
                onValueChange={val => setZoom(val)}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor={Colors.border}
                thumbTintColor={Colors.primary}
              />
              <Icon name="magnify-plus" size={16} color={Colors.textSecondary} />
              <Text style={styles.zoomLabel}>{zoom.toFixed(1)}x</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>

      {/* PTZ Controls */}
      <View style={styles.ptzSection}>
        <Text style={styles.sectionLabel}>Kontrol PTZ</Text>
        <View style={styles.ptzContainer}>
          <View style={styles.ptzGrid}>
            <View style={styles.ptzRow}>
              <View style={styles.ptzSpacer} />
              <TouchableOpacity
                style={styles.ptzBtn}
                onPress={() => handlePTZ('up')}>
                <Icon name="chevron-up" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
              <View style={styles.ptzSpacer} />
            </View>
            <View style={styles.ptzRow}>
              <TouchableOpacity
                style={styles.ptzBtn}
                onPress={() => handlePTZ('left')}>
                <Icon name="chevron-left" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
              <View style={styles.ptzCenter}>
                <Icon name="circle-small" size={20} color={Colors.textMuted} />
              </View>
              <TouchableOpacity
                style={styles.ptzBtn}
                onPress={() => handlePTZ('right')}>
                <Icon name="chevron-right" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.ptzRow}>
              <View style={styles.ptzSpacer} />
              <TouchableOpacity
                style={styles.ptzBtn}
                onPress={() => handlePTZ('down')}>
                <Icon name="chevron-down" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
              <View style={styles.ptzSpacer} />
            </View>
          </View>
          <View style={styles.ptzInfo}>
            <View style={styles.ptzInfoRow}>
              <Icon name="rotate-left" size={14} color={Colors.textMuted} />
              <Text style={styles.ptzInfoText}>Pan: {camera.pan || 0}°</Text>
            </View>
            <View style={styles.ptzInfoRow}>
              <Icon name="angle-acute" size={14} color={Colors.textMuted} />
              <Text style={styles.ptzInfoText}>Tilt: {camera.tilt || 0}°</Text>
            </View>
            <TouchableOpacity
              style={styles.ptzResetBtn}
              onPress={() => onUpdate({pan: 0, tilt: 0})}>
              <Text style={styles.ptzResetText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

// ─── Recordings Tab ───────────────────────────────────────────────────────────
const RecordingsTab = ({camera}) => {
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const recordings = mockRecordings.filter(r => r.cameraId === camera.id);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    dates.push(moment().subtract(i, 'days').format('YYYY-MM-DD'));
  }

  const filteredRecordings = recordings.filter(r => r.date === selectedDate);

  const typeIcon = type => {
    if (type === 'motion') return 'run-fast';
    if (type === 'manual') return 'hand-pointing-right';
    return 'clock-outline';
  };

  const typeColor = type => {
    if (type === 'motion') return Colors.warning;
    if (type === 'manual') return Colors.primary;
    return Colors.success;
  };

  const handlePlay = rec => {
    Alert.alert('Putar Rekaman', `Memutar: ${rec.date} ${rec.startTime}`, [
      {text: 'Tutup'},
    ]);
  };

  const handleDownload = rec => {
    Alert.alert('Unduh Rekaman', `Mengunduh ${rec.size}...`, [{text: 'OK'}]);
  };

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Date Filter */}
      <Text style={styles.sectionLabel}>Pilih Tanggal</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.datePicker}>
        {dates.map(date => (
          <TouchableOpacity
            key={date}
            style={[
              styles.dateChip,
              selectedDate === date && styles.dateChipActive,
            ]}
            onPress={() => setSelectedDate(date)}>
            <Text
              style={[
                styles.dateChipDay,
                selectedDate === date && styles.dateChipTextActive,
              ]}>
              {moment(date).format('ddd')}
            </Text>
            <Text
              style={[
                styles.dateChipDate,
                selectedDate === date && styles.dateChipTextActive,
              ]}>
              {moment(date).format('DD')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Timeline */}
      <Text style={styles.sectionLabel}>
        Timeline — {moment(selectedDate).format('DD MMMM YYYY')}
      </Text>

      {filteredRecordings.length > 0 ? (
        filteredRecordings.map((rec, index) => (
          <View key={rec.id} style={styles.recordingCard}>
            <View
              style={[
                styles.recordingTypeIcon,
                {backgroundColor: typeColor(rec.type) + '22'},
              ]}>
              <Icon
                name={typeIcon(rec.type)}
                size={18}
                color={typeColor(rec.type)}
              />
            </View>
            <View style={styles.recordingInfo}>
              <Text style={styles.recordingTime}>
                {rec.startTime} — {rec.endTime}
              </Text>
              <View style={styles.recordingMeta}>
                <Text style={styles.recordingDuration}>
                  <Icon name="timer-outline" size={12} /> {rec.duration}
                </Text>
                <Text style={styles.recordingSize}>
                  <Icon name="database" size={12} /> {rec.size}
                </Text>
              </View>
            </View>
            <View style={styles.recordingActions}>
              <TouchableOpacity
                style={styles.recActionBtn}
                onPress={() => handlePlay(rec)}>
                <Icon name="play" size={18} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.recActionBtn}
                onPress={() => handleDownload(rec)}>
                <Icon name="download" size={18} color={Colors.success} />
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyRecordings}>
          <Icon name="video-off-outline" size={40} color={Colors.textMuted} />
          <Text style={styles.emptyRecordingsText}>
            Tidak ada rekaman pada tanggal ini
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

// ─── Settings Tab ─────────────────────────────────────────────────────────────
const SettingsTab = ({camera, onUpdate}) => {
  const SettingRow = ({icon, label, value, onToggle, color = Colors.primary}) => (
    <View style={styles.settingRow}>
      <View style={[styles.settingIcon, {backgroundColor: color + '22'}]}>
        <Icon name={icon} size={18} color={color} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{false: Colors.border, true: color + '66'}}
        thumbColor={value ? color : Colors.textMuted}
        ios_backgroundColor={Colors.border}
      />
    </View>
  );

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionLabel}>Pengaturan Kamera</Text>
      <View style={styles.settingsCard}>
        <SettingRow
          icon="weather-night"
          label="Night Vision"
          value={camera.nightVision}
          onToggle={val => onUpdate({nightVision: val})}
          color={Colors.info}
        />
        <View style={styles.settingDivider} />
        <SettingRow
          icon="microphone"
          label="Audio"
          value={camera.audioEnabled}
          onToggle={val => onUpdate({audioEnabled: val})}
          color={Colors.success}
        />
        <View style={styles.settingDivider} />
        <SettingRow
          icon="run-fast"
          label="Deteksi Gerakan"
          value={camera.motionDetection}
          onToggle={val => onUpdate({motionDetection: val})}
          color={Colors.warning}
        />
        <View style={styles.settingDivider} />
        <SettingRow
          icon="record-circle"
          label="Rekaman Otomatis"
          value={camera.autoRecord}
          onToggle={val => onUpdate({autoRecord: val})}
          color={Colors.danger}
        />
      </View>

      <Text style={styles.sectionLabel}>Resolusi & Kualitas</Text>
      <View style={styles.settingsCard}>
        {['4K (3840x2160)', '1080p (1920x1080)', '720p (1280x720)'].map(
          res => (
            <TouchableOpacity
              key={res}
              style={styles.resolutionRow}
              onPress={() => onUpdate({resolution: res})}>
              <Text style={styles.resolutionText}>{res}</Text>
              {camera.resolution === res && (
                <Icon name="check-circle" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ),
        )}
      </View>

      <Text style={styles.sectionLabel}>Frame Rate</Text>
      <View style={styles.settingsCard}>
        {[15, 20, 25, 30].map(fps => (
          <TouchableOpacity
            key={fps}
            style={styles.resolutionRow}
            onPress={() => onUpdate({fps})}>
            <Text style={styles.resolutionText}>{fps} FPS</Text>
            {camera.fps === fps && (
              <Icon name="check-circle" size={20} color={Colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.dangerButton}>
        <Icon name="restart" size={18} color={Colors.danger} />
        <Text style={styles.dangerButtonText}>Restart Kamera</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ─── Info Tab ─────────────────────────────────────────────────────────────────
const InfoTab = ({camera}) => {
  const InfoRow = ({label, value, icon, valueColor}) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        {icon && (
          <Icon name={icon} size={14} color={Colors.textMuted} style={styles.infoIcon} />
        )}
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, valueColor && {color: valueColor}]}>
        {value}
      </Text>
    </View>
  );

  const batteryColor =
    camera.batteryLevel === null
      ? Colors.textMuted
      : camera.batteryLevel < 20
      ? Colors.danger
      : camera.batteryLevel < 50
      ? Colors.warning
      : Colors.success;

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionLabel}>Spesifikasi</Text>
      <View style={styles.infoCard}>
        <InfoRow label="Model" value={camera.model} icon="cctv" />
        <View style={styles.infoDivider} />
        <InfoRow label="Brand" value={camera.brand} icon="tag" />
        <View style={styles.infoDivider} />
        <InfoRow label="Resolusi" value={camera.resolution} icon="quality-high" />
        <View style={styles.infoDivider} />
        <InfoRow label="Frame Rate" value={`${camera.fps} FPS`} icon="speedometer" />
        <View style={styles.infoDivider} />
        <InfoRow label="Sudut Pandang" value={`${camera.angle}°`} icon="angle-acute" />
        <View style={styles.infoDivider} />
        <InfoRow label="Firmware" value={camera.firmware} icon="chip" />
      </View>

      <Text style={styles.sectionLabel}>Jaringan</Text>
      <View style={styles.infoCard}>
        <InfoRow label="IP Address" value={camera.ip} icon="ip" />
        <View style={styles.infoDivider} />
        <InfoRow label="MAC Address" value={camera.mac} icon="ethernet" />
      </View>

      <Text style={styles.sectionLabel}>Status</Text>
      <View style={styles.infoCard}>
        <InfoRow
          label="Status"
          value={camera.status === 'online' ? 'Online' : 'Offline'}
          icon="wifi"
          valueColor={camera.status === 'online' ? Colors.success : Colors.danger}
        />
        <View style={styles.infoDivider} />
        <InfoRow
          label="Terakhir Online"
          value={moment(camera.lastSeen).format('DD MMM YYYY HH:mm')}
          icon="clock-outline"
        />
        <View style={styles.infoDivider} />
        {camera.batteryLevel !== null && (
          <>
            <InfoRow
              label="Baterai"
              value={`${camera.batteryLevel}%`}
              icon="battery"
              valueColor={batteryColor}
            />
            <View style={styles.infoDivider} />
          </>
        )}
        <InfoRow
          label="Dipasang"
          value={moment(camera.installDate).format('DD MMMM YYYY')}
          icon="calendar-check"
        />
      </View>

      <Text style={styles.sectionLabel}>Lokasi</Text>
      <View style={styles.infoCard}>
        <InfoRow label="Nama" value={camera.name} icon="map-marker" />
        <View style={styles.infoDivider} />
        <InfoRow label="Lokasi" value={camera.location} icon="home" />
      </View>
    </ScrollView>
  );
};

// ─── Main Detail Screen ───────────────────────────────────────────────────────
const CameraDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {cameraId} = route.params;
  const {getCameraById, updateCamera} = useApp();

  const [activeTab, setActiveTab] = useState('live');
  const camera = getCameraById(cameraId);

  if (!camera) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Kamera tidak ditemukan</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleUpdate = updates => {
    updateCamera(cameraId, updates);
  };

  const statusColor =
    camera.status === 'online' ? Colors.success : Colors.offline;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={styles.detailHeader}>
        <View style={styles.detailHeaderContent}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.detailHeaderCenter}>
            <Text style={styles.detailHeaderTitle} numberOfLines={1}>
              {camera.name}
            </Text>
            <View style={styles.detailStatusRow}>
              <View
                style={[styles.statusDotSmall, {backgroundColor: statusColor}]}
              />
              <Text style={[styles.detailStatusText, {color: statusColor}]}>
                {camera.status === 'online' ? 'Online' : 'Offline'}
              </Text>
              <Text style={styles.detailLocationText}>· {camera.location}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreBtn}>
            <Icon name="dots-vertical" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}>
            <Icon
              name={tab.icon}
              size={16}
              color={activeTab === tab.id ? Colors.primary : Colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive,
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.tabContentContainer}>
        {activeTab === 'live' && (
          <LiveTab camera={camera} onUpdate={handleUpdate} />
        )}
        {activeTab === 'recordings' && <RecordingsTab camera={camera} />}
        {activeTab === 'settings' && (
          <SettingsTab camera={camera} onUpdate={handleUpdate} />
        )}
        {activeTab === 'info' && <InfoTab camera={camera} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  detailHeader: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  detailHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailHeaderCenter: {
    flex: 1,
  },
  detailHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  detailStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  statusDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  detailStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailLocationText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  moreBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 5,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  tabContentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  // Live Tab
  liveContainer: {
    flex: 1,
  },
  playerContainer: {
    height: PLAYER_HEIGHT,
    backgroundColor: Colors.backgroundCard,
    position: 'relative',
  },
  playerBg: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  playerPlaceholderText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  hudOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  hudTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  hudTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hudLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + 'CC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
  },
  hudLiveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textWhite,
  },
  hudLiveText: {
    color: Colors.textWhite,
    fontSize: 11,
    fontWeight: '700',
  },
  hudTime: {
    color: Colors.textWhite,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  hudTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hudResText: {
    color: Colors.textWhite,
    fontSize: 11,
    fontWeight: '600',
  },
  hudCameraName: {
    alignSelf: 'flex-start',
    marginLeft: 10,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  hudBottom: {
    padding: 10,
    gap: 8,
  },
  hudActions: {
    flexDirection: 'row',
    gap: 8,
  },
  hudBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  hudBtnActive: {
    backgroundColor: 'rgba(26,115,232,0.5)',
    borderColor: Colors.primary,
  },
  hudBtnRecord: {
    backgroundColor: 'rgba(239,68,68,0.3)',
    borderColor: Colors.danger,
  },
  zoomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  zoomSlider: {
    flex: 1,
    height: 30,
  },
  zoomLabel: {
    color: Colors.textWhite,
    fontSize: 11,
    width: 32,
    textAlign: 'right',
  },
  // PTZ
  ptzSection: {
    padding: 16,
    flex: 1,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 4,
  },
  ptzContainer: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  ptzGrid: {
    gap: 4,
  },
  ptzRow: {
    flexDirection: 'row',
    gap: 4,
  },
  ptzBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ptzSpacer: {
    width: 48,
    height: 48,
  },
  ptzCenter: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ptzInfo: {
    flex: 1,
    gap: 10,
  },
  ptzInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ptzInfoText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  ptzResetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: 'flex-start',
  },
  ptzResetText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  // Recordings Tab
  datePicker: {
    gap: 8,
    paddingBottom: 16,
    paddingRight: 4,
  },
  dateChip: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 54,
  },
  dateChipActive: {
    backgroundColor: Colors.primary + '22',
    borderColor: Colors.primary,
  },
  dateChipDay: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  dateChipDate: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  dateChipTextActive: {
    color: Colors.primary,
  },
  recordingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recordingTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingInfo: {
    flex: 1,
  },
  recordingTime: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  recordingMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  recordingDuration: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  recordingSize: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  recordingActions: {
    flexDirection: 'row',
    gap: 6,
  },
  recActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyRecordings: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyRecordingsText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  // Settings Tab
  settingsCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  settingDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: 14,
  },
  resolutionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  resolutionText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.danger + '44',
    backgroundColor: Colors.danger + '11',
    marginBottom: 24,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.danger,
  },
  // Info Tab
  infoCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIcon: {
    width: 16,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
    maxWidth: '55%',
    textAlign: 'right',
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: 14,
  },
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  backLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default CameraDetailScreen;
