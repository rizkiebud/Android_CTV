import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {useApp} from '../../context/AppContext';
import Colors from '../../utils/colors';
import moment from 'moment';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const FILTERS = [
  {id: 'all', label: 'Semua'},
  {id: 'online', label: 'Online'},
  {id: 'offline', label: 'Offline'},
  {id: 'recording', label: 'Merekam'},
];

const CameraGridCard = ({camera, onPress}) => {
  const statusColor = camera.status === 'online' ? Colors.live : Colors.offline;
  return (
    <TouchableOpacity
      style={styles.gridCard}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.gridPreview}>
        <View style={styles.gridPreviewBg}>
          <Icon name="cctv" size={36} color={Colors.textMuted} />
        </View>
        {/* Badges */}
        <View style={styles.gridBadges}>
          {camera.isLive && camera.status === 'online' && (
            <View style={styles.liveBadge}>
              <View style={styles.liveIndicator} />
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
          )}
          {camera.isRecording && (
            <View style={styles.recBadge}>
              <Icon name="record" size={8} color={Colors.textWhite} />
              <Text style={styles.recBadgeText}>REC</Text>
            </View>
          )}
        </View>
        {camera.hasMotion && (
          <View style={styles.motionBadge}>
            <Icon name="run-fast" size={12} color={Colors.textWhite} />
          </View>
        )}
        {camera.batteryLevel !== null && camera.batteryLevel < 20 && (
          <View style={styles.batteryBadge}>
            <Icon name="battery-alert" size={12} color={Colors.textWhite} />
            <Text style={styles.batteryBadgeText}>{camera.batteryLevel}%</Text>
          </View>
        )}
        {camera.status === 'offline' && (
          <View style={styles.offlineOverlay}>
            <Icon name="wifi-off" size={20} color={Colors.textMuted} />
            <Text style={styles.offlineText}>Offline</Text>
          </View>
        )}
      </View>
      <View style={styles.gridCardInfo}>
        <View style={styles.gridCardHeader}>
          <View style={[styles.statusDot, {backgroundColor: statusColor}]} />
          <Text style={styles.gridCardName} numberOfLines={1}>
            {camera.name}
          </Text>
        </View>
        <Text style={styles.gridCardLocation} numberOfLines={1}>
          {camera.location}
        </Text>
        <Text style={styles.gridCardTime}>
          {moment(camera.lastSeen).fromNow()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const CameraListCard = ({camera, onPress}) => {
  const statusColor = camera.status === 'online' ? Colors.live : Colors.offline;
  const statusLabel = camera.status === 'online' ? 'Online' : 'Offline';

  return (
    <TouchableOpacity
      style={styles.listCard}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.listPreview}>
        <View style={styles.listPreviewBg}>
          <Icon name="cctv" size={24} color={Colors.textMuted} />
        </View>
        {camera.isLive && camera.status === 'online' && (
          <View style={styles.listLiveBadge}>
            <View style={styles.liveIndicator} />
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
        )}
      </View>
      <View style={styles.listCardContent}>
        <View style={styles.listCardHeader}>
          <Text style={styles.listCardName} numberOfLines={1}>
            {camera.name}
          </Text>
          <View style={styles.listBadges}>
            {camera.isRecording && (
              <View style={styles.smallRecBadge}>
                <Icon name="record" size={8} color={Colors.danger} />
                <Text style={styles.smallRecText}>REC</Text>
              </View>
            )}
            {camera.hasMotion && (
              <View style={styles.smallMotionBadge}>
                <Icon name="run-fast" size={10} color={Colors.warning} />
              </View>
            )}
            {camera.batteryLevel !== null && camera.batteryLevel < 20 && (
              <View style={styles.smallBatteryBadge}>
                <Icon name="battery-alert" size={10} color={Colors.danger} />
              </View>
            )}
          </View>
        </View>
        <Text style={styles.listCardLocation}>{camera.location}</Text>
        <View style={styles.listCardFooter}>
          <View style={styles.listStatusRow}>
            <View style={[styles.statusDot, {backgroundColor: statusColor}]} />
            <Text style={[styles.listStatusText, {color: statusColor}]}>
              {statusLabel}
            </Text>
          </View>
          <Text style={styles.listCardTime}>
            {moment(camera.lastSeen).fromNow()}
          </Text>
        </View>
      </View>
      <Icon name="chevron-right" size={20} color={Colors.textMuted} />
    </TouchableOpacity>
  );
};

const CameraListScreen = () => {
  const navigation = useNavigation();
  const {cameras, onlineCamerasCount, offlineCamerasCount, recordingCamerasCount} =
    useApp();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const filteredCameras = useMemo(() => {
    let result = [...cameras];

    if (activeFilter === 'online') {
      result = result.filter(c => c.status === 'online');
    } else if (activeFilter === 'offline') {
      result = result.filter(c => c.status === 'offline');
    } else if (activeFilter === 'recording') {
      result = result.filter(c => c.isRecording);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        c =>
          c.name.toLowerCase().includes(query) ||
          c.location.toLowerCase().includes(query),
      );
    }

    return result;
  }, [cameras, activeFilter, searchQuery]);

  const getFilterCount = filterId => {
    if (filterId === 'all') return cameras.length;
    if (filterId === 'online') return onlineCamerasCount;
    if (filterId === 'offline') return offlineCamerasCount;
    if (filterId === 'recording') return recordingCamerasCount;
    return 0;
  };

  const navigateToDetail = camera => {
    navigation.navigate('CameraDetail', {cameraId: camera.id});
  };

  const renderGridItem = ({item}) => (
    <CameraGridCard camera={item} onPress={() => navigateToDetail(item)} />
  );

  const renderListItem = ({item}) => (
    <CameraListCard camera={item} onPress={() => navigateToDetail(item)} />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={styles.header}>
        {showSearch ? (
          <View style={styles.searchBar}>
            <Icon name="magnify" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari kamera..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
            <TouchableOpacity
              onPress={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}>
              <Icon name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Monitoring CCTV</Text>
              <Text style={styles.headerSubtitle}>
                {onlineCamerasCount}/{cameras.length} kamera aktif
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => setShowSearch(true)}>
                <Icon name="magnify" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() =>
                  setViewMode(viewMode === 'grid' ? 'list' : 'grid')
                }>
                <Icon
                  name={viewMode === 'grid' ? 'view-list' : 'view-grid'}
                  size={20}
                  color={Colors.textPrimary}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Filters */}
        <View style={styles.filtersContainer}>
          {FILTERS.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                activeFilter === filter.id && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter.id)}>
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === filter.id && styles.filterChipTextActive,
                ]}>
                {filter.label}
              </Text>
              <View
                style={[
                  styles.filterCount,
                  activeFilter === filter.id && styles.filterCountActive,
                ]}>
                <Text
                  style={[
                    styles.filterCountText,
                    activeFilter === filter.id && styles.filterCountTextActive,
                  ]}>
                  {getFilterCount(filter.id)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Camera List */}
      {filteredCameras.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="cctv-off" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyStateTitle}>Tidak ada kamera</Text>
          <Text style={styles.emptyStateText}>
            Tidak ada kamera yang sesuai dengan filter
          </Text>
        </View>
      ) : viewMode === 'grid' ? (
        <FlatList
          data={filteredCameras}
          renderItem={renderGridItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={filteredCameras}
          renderItem={renderListItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        />
      )}
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
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    paddingVertical: 0,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: Colors.primary + '22',
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.primary,
  },
  filterCount: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 10,
    minWidth: 20,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  filterCountActive: {
    backgroundColor: Colors.primary,
  },
  filterCountText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  filterCountTextActive: {
    color: Colors.textWhite,
  },
  // Grid styles
  gridContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  gridRow: {
    gap: 12,
    marginBottom: 12,
  },
  gridCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gridPreview: {
    height: 110,
    position: 'relative',
  },
  gridPreviewBg: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridBadges: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    gap: 4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + 'EE',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  liveIndicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.textWhite,
  },
  liveBadgeText: {
    color: Colors.textWhite,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger + 'EE',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  recBadgeText: {
    color: Colors.textWhite,
    fontSize: 8,
    fontWeight: '700',
  },
  motionBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.warning + 'EE',
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  batteryBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger + 'EE',
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  batteryBadgeText: {
    color: Colors.textWhite,
    fontSize: 9,
    fontWeight: '600',
  },
  offlineOverlay: {
    position: 'absolute',
    inset: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  offlineText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  gridCardInfo: {
    padding: 10,
  },
  gridCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  gridCardName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  gridCardLocation: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  gridCardTime: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  // List styles
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listSeparator: {
    height: 10,
  },
  listPreview: {
    width: 72,
    height: 56,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  listPreviewBg: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listLiveBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + 'EE',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    gap: 3,
  },
  listCardContent: {
    flex: 1,
  },
  listCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  listBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  smallRecBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.danger + '22',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  smallRecText: {
    fontSize: 9,
    color: Colors.danger,
    fontWeight: '700',
  },
  smallMotionBadge: {
    backgroundColor: Colors.warning + '22',
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallBatteryBadge: {
    backgroundColor: Colors.danger + '22',
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listCardLocation: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  listCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  listStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  listStatusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  listCardTime: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default CameraListScreen;
