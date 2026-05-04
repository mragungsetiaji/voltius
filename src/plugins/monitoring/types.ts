export interface MetricsSnapshot {
  ts: number;
  cpu_percent: number;
  mem_used_kb: number;
  mem_total_kb: number;
  net_rx_bytes_per_sec: number;
  net_tx_bytes_per_sec: number;
  disks: DiskInfo[] | null;
}

export interface DiskInfo {
  mount: string;
  used_kb: number;
  total_kb: number;
}

export interface SystemInfo {
  cpu_brand: string;
  cpu_cores_physical: number;
  cpu_cores_logical: number;
  mem_total_kb: number;
  os_name: string;
  os_version: string;
  kernel_version: string;
  host_name: string;
  arch: string;
  gpus: string[];
}
