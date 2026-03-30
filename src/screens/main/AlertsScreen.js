import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {useApp} from '../../context/AppContext';
import Colors from '../../utils/colors';
import moment from 'moment';

const FILTER_CATEGORIES = [
  {id: 'all', label: 'Semua', icon: 'bell'},
  {id: 'motion', label: 'Gerakan', icon: 'run-fast'},
  {id: 'offline', label: 'Offline', icon: 'wifi-off'},
  {id: 'battery', label: 'Baterai', icon: 'battery-alert'},
  {id: 'system', label: 'Sistem', icon: 'cog'},
];

const getSeverityColor = severity => {
  switch (severity) {
    case 'high':
      return Colors.severityHigh;
    case 'medium':
      return Colors.severityMedium;
    default:
      return Colors.severityLow;
  }
};

const getSeverityLabel = severity => {
  switch (severity) {
    case 'high':
      return 'Tinggi';
    case 'medium':
      return 'Sedang';
    default:
      return 'Rendah';
  }
};

const getAlertIcon = type => {
  switch (type) {
    case 'motion':
      return 'run-fast';
    case 'battery':
      return 'battery-alert';
    case 'offline':
      return 'wifi-off';
    case 'recording':
      return 'record-circle';
    default:
      return 'bell-alert';
  }
};

const AlertCard = ({alert, onRead, onDelete, onNavigate}) => {
  const severityColor = getSeverityColor(alert.severity);
  const iconName = getAlertIcon(alert.type);

  return (
    <View style={[styles.alertCard, !alert.isRead && styles.alertCardUnread]}>
      {/* Left accent */}
      <View style={[styles.severityAccent, {backgroundColor: severityColor}]} />

      <View style={styles.alertCardContent}>
        <View style={styles.alertCardHeader}>
          <View
            style={[styles.alertIcon, {backgroundColor: severityColor + '22'}]}>
            <Icon name={iconName} size={20} color={severityColor} />
          </View>
          <View style={styles.alertTitleSection}>
            <View style={styles.alertTitleRow}>
              <Text style={styles.alertTitle} numberOfLines={1}>
                {alert.title}
              </Text>
              {!alert.isRead && <View style={styles.unreadDot} />}
            </View>
            <View style={styles.alertMeta}>
              <View
                style={[
                  styles.severityBadge,
                  {backgroundColor: severityColor + '22'},
                ]}>
                <Text style={[styles.severityText, {color: severityColor}]}>
                  {getSeverityLabel(alert.severity)}
                </Text>
              </View>
              <Text style={styles.alertCameraName}>{alert.cameraName}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.alertMessage} numberOfLines={2}>
          {alert.message}
        </Text>

        <View style={styles.alertFooter}>
          <View style={styles.alertTime}>
            <Icon name="clock-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.alertTimeText}>
              {moment(alert.timestamp).fromNow()}
            </Text>
          </View>
          <View style={styles.alertActions}>
            <TouchableOpacity
              style={styles.alertActionBtn}
              onPress={() => onNavigate(alert)}>
              <Icon name="cctv" size={14} color={Colors.primary} />
              <Text style={styles.alertActionText}>Lihat</Text>
            </TouchableOpacity>
            {!alert.isRead && (
              <TouchableOpacity
                style={[styles.alertActionBtn, styles.alertActionRead]}
                onPress={() => onRead(alert.id)}>
                <Icon name="check" size={14} color={Colors.success} />
                <Text style={[styles.alertActionText, {color: Colors.success}]}>
                  Baca
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.alertActionBtn, styles.alertActionDelete]}
              onPress={() => onDelete(alert.id)}>
              <Icon name="trash-can-outline" size={14} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const AlertsScreen = () => {
  const navigation = useNavigation();
  const {alerts, unreadAlertsCount, markAlertRead, markAllAlertsRead, deleteAlert, clearAllAlerts} =
    useApp();
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredAlerts = useMemo(() => {
    let result = [...alerts];
    if (activeCategory !== 'all') {
      result = result.filter(a => a.type === activeCategory);
    }
    return result.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    );
  }, [alerts, activeCategory]);

  const handleNavigateToCamera = alert => {
    navigation.navigate('Dashboard', {
      screen: 'CameraDetail',
      params: {cameraId: alert.cameraId},
    });
  };

  const handleDelete = alertId => {
    Alert.alert('Hapus Peringatan', 'Yakin ingin menghapus peringatan ini?', [
      {text: 'Batal', style: 'cancel'},
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => deleteAlert(alertId),
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Hapus Semua',
      'Yakin ingin menghapus semua peringatan?',
      [
        {text: 'Batal', style: 'cancel'},
        {
          text: 'Hapus Semua',
          style: 'destructive',
          onPress: clearAllAlerts,
        },
      ],
    );
  };

  const getCategoryCount = categoryId => {
    if (categoryId === 'all') return alerts.length;
    return alerts.filter(a => a.type === categoryId).length;
  };

  const renderItem = ({item}) => (
    <AlertCard
      alert={item}
      onRead={markAlertRead}
      onDelete={handleDelete}
      onNavigate={handleNavigateToCamera}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Peringatan</Text>
            {unreadAlertsCount > 0 && (
              <Text style={styles.headerSubtitle}>
                {unreadAlertsCount} belum dibaca
              </Text>
            )}
          </View>
          <View style={styles.headerActions}>
            {unreadAlertsCount > 0 && (
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={markAllAlertsRead}>
                <Icon name="check-all" size={20} color={Colors.success} />
              </TouchableOpacity>
            )}
            {alerts.length > 0 && (
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={handleClearAll}>
                <Icon
                  name="trash-can-outline"
                  size={20}
                  color={Colors.danger}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filters */}
        <View style={styles.categoriesScroll}>
          {FILTER_CATEGORIES.map(cat => {
            const count = getCategoryCount(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  activeCategory === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => setActiveCategory(cat.id)}>
                <Icon
                  name={cat.icon}
                  size={14}
                  color={
                    activeCategory === cat.id
                      ? Colors.primary
                      : Colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    activeCategory === cat.id && styles.categoryChipTextActive,
                  ]}>
                  {cat.label}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.categoryCount,
                      activeCategory === cat.id && styles.categoryCountActive,
                    ]}>
                    <Text
                      style={[
                        styles.categoryCountText,
                        activeCategory === cat.id &&
                          styles.categoryCountTextActive,
                      ]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>

      {/* Alert List */}
      {filteredAlerts.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBg}>
            <Icon name="bell-check-outline" size={48} color={Colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Tidak ada peringatan</Text>
          <Text style={styles.emptySubtitle}>
            {activeCategory === 'all'
              ? 'Semua aman, tidak ada peringatan saat ini'
              : 'Tidak ada peringatan dalam kategori ini'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAlerts}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    color: Colors.warning,
    marginTop: 2,
    fontWeight: '500',
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
  categoriesScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 5,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary + '22',
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  categoryCount: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 8,
    minWidth: 18,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  categoryCountActive: {
    backgroundColor: Colors.primary,
  },
  categoryCountText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  categoryCountTextActive: {
    color: Colors.textWhite,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  separator: {
    height: 10,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  alertCardUnread: {
    borderColor: Colors.primary + '44',
    backgroundColor: Colors.primary + '08',
  },
  severityAccent: {
    width: 4,
  },
  alertCardContent: {
    flex: 1,
    padding: 14,
    gap: 8,
  },
  alertCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertTitleSection: {
    flex: 1,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  severityBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  alertCameraName: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  alertMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  alertFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  alertTimeText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 6,
  },
  alertActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.primary + '22',
    gap: 4,
  },
  alertActionRead: {
    backgroundColor: Colors.success + '22',
  },
  alertActionDelete: {
    backgroundColor: Colors.danger + '11',
    paddingHorizontal: 8,
  },
  alertActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    padding: 32,
  },
  emptyIconBg: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AlertsScreen;
