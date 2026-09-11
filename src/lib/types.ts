// CF-Server-Monitor 主题 API 类型定义
// 数值单位：内存 / 磁盘为 MB，网络速率为 B/s，累计流量为 B

export interface DiskIo {
  read_bps?: number
  write_bps?: number
  read_iops?: number
  write_iops?: number
  await_ms?: number
  util?: number
}

export interface PingPoint {
  ts: number
  ct?: number | boolean
  cu?: number | boolean
  cm?: number | boolean
  bd?: number | boolean
}

export interface Server {
  id: string
  name: string
  server_group?: string
  region?: string
  tags?: string
  price?: string
  billing_cycle?: string
  auto_renewal?: string | number
  currency?: string
  expire_date?: string
  traffic_limit?: string
  traffic_calc_type?: string
  reset_day?: number
  report_interval?: number
  wss_report_interval?: number
  is_hidden?: number | string
  sort_order?: number
  // 指标
  cpu?: number
  load_avg?: string
  ram_total?: number
  ram_used?: number
  swap_total?: number
  swap_used?: number
  disk_total?: number
  disk_used?: number
  disk?: DiskIo
  net_in_speed?: number
  net_out_speed?: number
  net_rx?: number
  net_tx?: number
  net_rx_monthly?: number
  net_tx_monthly?: number
  processes?: number
  tcp_conn?: number
  udp_conn?: number
  // 硬件 / 系统
  cpu_cores?: number
  cpu_info?: string
  gpu_info?: string
  arch?: string
  os?: string
  kernel_version?: string
  agent_version?: string
  boot_time?: number
  ip_v4?: number | string
  ip_v6?: number | string
  // Ping
  ping?: PingPoint[]
  loss?: PingPoint[]
  ping_ct?: number | boolean
  ping_cu?: number | boolean
  ping_cm?: number | boolean
  ping_bd?: number | boolean
  loss_ct?: number | boolean
  loss_cu?: number | boolean
  loss_cm?: number | boolean
  loss_bd?: number | boolean
  // 状态
  last_updated?: number
  timestamp?: number
}

export interface ServersStats {
  total: number
  online: number
  offline: number
  globalSpeedIn?: number
  globalSpeedOut?: number
  globalNetTx?: number
  globalNetRx?: number
}

export interface ServersResponse {
  servers: Server[]
  stats: ServersStats
  regionStats?: Record<string, number>
  sysConfig?: SysConfig
  latestReportUpdates?: ReportUpdate[]
}

export interface SysConfig {
  show_price?: boolean
  show_expire?: boolean
  show_tf?: boolean
  show_three_net_details?: boolean
  custom_ct_name?: string
  custom_cu_name?: string
  custom_cm_name?: string
  custom_bd_name?: string
  display_mode?: string
}

export interface Sample {
  ts: number
  data?: Partial<Server>
  payload?: Partial<Server>
  metrics?: Partial<Server>
}

export interface ReportUpdate {
  serverId: string
  reportTs?: number
  reportAgeMs?: number
  samples?: Sample[]
}

export interface HistoryPoint {
  timestamp: number
  cpu?: number
  gpu_info?: string
  ram_total?: number
  ram_used?: number
  disk_total?: number
  disk_used?: number
  disk?: DiskIo
  processes?: number
  net_in_speed?: number
  net_out_speed?: number
  tcp_conn?: number
  udp_conn?: number
  swap_total?: number
  swap_used?: number
  load_avg?: string
  region?: string
  kernel_version?: string
}

export interface ApiConfig {
  version: string
  last_workers_version?: string | null
  last_agent_version?: string | null
  is_public: boolean
  authorization: boolean
  turnstile_enabled: boolean
  turnstile_login_enabled: boolean
  turnstile_site_key: string
  custom_ct_name: string
  custom_cu_name: string
  custom_cm_name: string
  custom_bd_name: string
  site_title: string
  preferred_theme: string
  default_language: string
  theme_options: Record<string, unknown>
  verified: boolean
  turnstile_verified: string | null
  frontend_ws_timeout_minutes: number
  long_history_points: number
  latency_window: { points: number; hours: number }
}

export interface WsBatchUpdate {
  type: 'batchUpdate'
  ts: number
  updates: Array<{ serverId: string; samples: Sample[] }>
}
