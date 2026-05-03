/**
 * Settings views — re-exports of the kit-styled implementations in
 * Bridge/ui/AppSettings.tsx. Kept as a per-app file so the autoComponentMap
 * can dynamic-import a stable path (no cross-app changes needed if Bridge
 * paths shift later). Templates can still override any view via
 * HostRegistration.register(id, Component).
 */
export {
  AgencyConfiguratorView,
  GlobalSettingsView,
  IntegrationsView,
  AgencyBuilderView,
  AllUsersView,
  DashboardView,
} from '@aqua/bridge/ui/AppSettings';
