// OS 图标：复用 CF-Server-Monitor 自带的 /os-icons/（同源，无需打包）
const OS_ICON_BASE = '/os-icons/'

const OS_CONFIGS: { image: string; keywords: string[] }[] = [
  { image: 'os-alma.svg', keywords: ['alma', 'almalinux'] },
  { image: 'os-alpine.webp', keywords: ['alpine'] },
  { image: 'os-centos.svg', keywords: ['centos', 'cent os'] },
  { image: 'os-debian.svg', keywords: ['debian', 'deb'] },
  { image: 'os-ubuntu.svg', keywords: ['ubuntu', 'elementary'] },
  { image: 'os-macos.svg', keywords: ['macos', 'mac os', 'darwin', 'os x'] },
  {
    image: 'os-windows.svg',
    keywords: ['windows', 'win32', 'win64', 'win10', 'win11', 'microsoft'],
  },
  { image: 'os-arch.svg', keywords: ['arch'] },
  { image: 'os-kail.svg', keywords: ['kail', 'kali'] },
  { image: 'os-istore.png', keywords: ['istore'] },
  { image: 'os-openwrt.svg', keywords: ['openwrt', 'open wrt', 'open-wrt', 'qwrt'] },
  { image: 'os-nix.svg', keywords: ['nixos', 'nix'] },
  { image: 'os-rocky.svg', keywords: ['rocky'] },
  { image: 'os-fedora.svg', keywords: ['fedora'] },
  { image: 'os-openSUSE.svg', keywords: ['opensuse', 'suse'] },
  { image: 'os-gentoo.svg', keywords: ['gentoo'] },
  { image: 'os-redhat.svg', keywords: ['redhat', 'rhel', 'red hat'] },
  { image: 'os-mint.svg', keywords: ['mint'] },
  { image: 'os-manjaro-.svg', keywords: ['manjaro'] },
  { image: 'os-armbian.png', keywords: ['armbian'] },
  { image: 'os-synology.ico', keywords: ['synology', 'dsm'] },
  { image: 'os-proxmox.ico', keywords: ['proxmox', 'pve'] },
  {
    image: 'os-alibaba.svg',
    keywords: ['alibaba', 'aliyun', 'alinux', 'anolis', '阿里', '龙蜥'],
  },
  { image: 'os-opencloud.svg', keywords: ['opencloud'] },
  { image: 'os-oracle.svg', keywords: ['oracle'] },
]

export function osIconUrl(osString?: string): string {
  const input = String(osString || '').toLowerCase()
  for (const config of OS_CONFIGS) {
    if (config.keywords.some((k) => input.includes(k))) {
      return `${OS_ICON_BASE}${config.image}`
    }
  }
  return `${OS_ICON_BASE}os-unknown.svg`
}
