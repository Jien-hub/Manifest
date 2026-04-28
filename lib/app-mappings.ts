// Curated mappings for common enterprise applications
// Maps normalized app names to their Winget IDs and GitHub repos

export interface AppMapping {
  wingetId: string;
  githubRepo?: string; // org/repo format
  displayName: string; // Clean display name
}

// Normalize app name for matching
export function normalizeAppName(name: string): string {
  return name
    .toLowerCase()
    // Remove version numbers from name (e.g., "Google Chrome 120.0.6099.130" -> "google chrome")
    .replace(/\s+v?\d+(\.\d+)*(\.\d+)*(\.\d+)*/gi, '')
    // Remove common suffixes
    .replace(/\s*(x64|x86|64-bit|32-bit|amd64|arm64|\(64-bit\)|\(32-bit\))/gi, '')
    // Remove edition markers
    .replace(/\s*(enterprise|professional|pro|home|standard|business|education)/gi, '')
    // Remove installer type markers  
    .replace(/\s*(msi|exe|msix|setup|installer)/gi, '')
    // Remove special characters and extra whitespace
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract version from app name if present
export function extractVersionFromName(name: string): string | null {
  // Match version patterns like "120.0.6099.130" or "v1.2.3"
  const versionMatch = name.match(/\b v?(\d+(?:\.\d+){1,3})\b/);
  return versionMatch ? versionMatch[1] : null;
}

// Common enterprise app mappings
export const APP_MAPPINGS: Record<string, AppMapping> = {
  // Browsers
  'google chrome': { wingetId: 'Google.Chrome', githubRepo: undefined, displayName: 'Google Chrome' },
  'chrome': { wingetId: 'Google.Chrome', githubRepo: undefined, displayName: 'Google Chrome' },
  'microsoft edge': { wingetId: 'Microsoft.Edge', githubRepo: undefined, displayName: 'Microsoft Edge' },
  'edge': { wingetId: 'Microsoft.Edge', githubRepo: undefined, displayName: 'Microsoft Edge' },
  'mozilla firefox': { wingetId: 'Mozilla.Firefox', githubRepo: undefined, displayName: 'Mozilla Firefox' },
  'firefox': { wingetId: 'Mozilla.Firefox', githubRepo: undefined, displayName: 'Mozilla Firefox' },
  'brave': { wingetId: 'Brave.Brave', githubRepo: 'brave/brave-browser', displayName: 'Brave Browser' },
  'vivaldi': { wingetId: 'Vivaldi.Vivaldi', githubRepo: undefined, displayName: 'Vivaldi' },
  'opera': { wingetId: 'Opera.Opera', githubRepo: undefined, displayName: 'Opera' },
  
  // Development Tools
  'visual studio code': { wingetId: 'Microsoft.VisualStudioCode', githubRepo: 'microsoft/vscode', displayName: 'Visual Studio Code' },
  'vs code': { wingetId: 'Microsoft.VisualStudioCode', githubRepo: 'microsoft/vscode', displayName: 'Visual Studio Code' },
  'vscode': { wingetId: 'Microsoft.VisualStudioCode', githubRepo: 'microsoft/vscode', displayName: 'Visual Studio Code' },
  'git': { wingetId: 'Git.Git', githubRepo: 'git-for-windows/git', displayName: 'Git' },
  'github desktop': { wingetId: 'GitHub.GitHubDesktop', githubRepo: 'desktop/desktop', displayName: 'GitHub Desktop' },
  'nodejs': { wingetId: 'OpenJS.NodeJS.LTS', githubRepo: 'nodejs/node', displayName: 'Node.js' },
  'node js': { wingetId: 'OpenJS.NodeJS.LTS', githubRepo: 'nodejs/node', displayName: 'Node.js' },
  'python': { wingetId: 'Python.Python.3.12', githubRepo: undefined, displayName: 'Python' },
  'powershell': { wingetId: 'Microsoft.PowerShell', githubRepo: 'PowerShell/PowerShell', displayName: 'PowerShell' },
  'windows terminal': { wingetId: 'Microsoft.WindowsTerminal', githubRepo: 'microsoft/terminal', displayName: 'Windows Terminal' },
  'postman': { wingetId: 'Postman.Postman', githubRepo: undefined, displayName: 'Postman' },
  'notepad': { wingetId: 'Notepad++.Notepad++', githubRepo: 'notepad-plus-plus/notepad-plus-plus', displayName: 'Notepad++' },
  'sublime text': { wingetId: 'SublimeHQ.SublimeText.4', githubRepo: undefined, displayName: 'Sublime Text' },
  'alacritty': { wingetId: 'Alacritty.Alacritty', githubRepo: 'alacritty/alacritty', displayName: 'Alacritty' },
  
  // Communication
  'microsoft teams': { wingetId: 'Microsoft.Teams', githubRepo: undefined, displayName: 'Microsoft Teams' },
  'teams': { wingetId: 'Microsoft.Teams', githubRepo: undefined, displayName: 'Microsoft Teams' },
  'zoom': { wingetId: 'Zoom.Zoom', githubRepo: undefined, displayName: 'Zoom' },
  'slack': { wingetId: 'SlackTechnologies.Slack', githubRepo: undefined, displayName: 'Slack' },
  'discord': { wingetId: 'Discord.Discord', githubRepo: undefined, displayName: 'Discord' },
  'webex': { wingetId: 'Cisco.WebexTeams', githubRepo: undefined, displayName: 'Webex' },
  
  // Office & Productivity
  'microsoft 365': { wingetId: 'Microsoft.Office', githubRepo: undefined, displayName: 'Microsoft 365' },
  'office 365': { wingetId: 'Microsoft.Office', githubRepo: undefined, displayName: 'Microsoft 365' },
  'microsoft office': { wingetId: 'Microsoft.Office', githubRepo: undefined, displayName: 'Microsoft Office' },
  'adobe acrobat': { wingetId: 'Adobe.Acrobat.Reader.64-bit', githubRepo: undefined, displayName: 'Adobe Acrobat Reader' },
  'acrobat reader': { wingetId: 'Adobe.Acrobat.Reader.64-bit', githubRepo: undefined, displayName: 'Adobe Acrobat Reader' },
  'adobe reader': { wingetId: 'Adobe.Acrobat.Reader.64-bit', githubRepo: undefined, displayName: 'Adobe Acrobat Reader' },
  'foxit reader': { wingetId: 'Foxit.FoxitReader', githubRepo: undefined, displayName: 'Foxit Reader' },
  'libreoffice': { wingetId: 'TheDocumentFoundation.LibreOffice', githubRepo: undefined, displayName: 'LibreOffice' },
  'onenote': { wingetId: 'Microsoft.Office', githubRepo: undefined, displayName: 'Microsoft OneNote' },
  
  // Utilities
  '7 zip': { wingetId: '7zip.7zip', githubRepo: undefined, displayName: '7-Zip' },
  '7zip': { wingetId: '7zip.7zip', githubRepo: undefined, displayName: '7-Zip' },
  'winrar': { wingetId: 'RARLab.WinRAR', githubRepo: undefined, displayName: 'WinRAR' },
  'vlc': { wingetId: 'VideoLAN.VLC', githubRepo: undefined, displayName: 'VLC Media Player' },
  'vlc media player': { wingetId: 'VideoLAN.VLC', githubRepo: undefined, displayName: 'VLC Media Player' },
  'keepass': { wingetId: 'DominikReichl.KeePass', githubRepo: undefined, displayName: 'KeePass' },
  'bitwarden': { wingetId: 'Bitwarden.Bitwarden', githubRepo: 'bitwarden/clients', displayName: 'Bitwarden' },
  '1password': { wingetId: 'AgileBits.1Password', githubRepo: undefined, displayName: '1Password' },
  'lastpass': { wingetId: 'LogMeIn.LastPass', githubRepo: undefined, displayName: 'LastPass' },
  'ccleaner': { wingetId: 'Piriform.CCleaner', githubRepo: undefined, displayName: 'CCleaner' },
  'everything': { wingetId: 'voidtools.Everything', githubRepo: undefined, displayName: 'Everything' },
  'greenshot': { wingetId: 'Greenshot.Greenshot', githubRepo: 'greenshot/greenshot', displayName: 'Greenshot' },
  'sharex': { wingetId: 'ShareX.ShareX', githubRepo: 'ShareX/ShareX', displayName: 'ShareX' },
  'putty': { wingetId: 'PuTTY.PuTTY', githubRepo: undefined, displayName: 'PuTTY' },
  'winscp': { wingetId: 'WinSCP.WinSCP', githubRepo: 'winscp/winscp', displayName: 'WinSCP' },
  'filezilla': { wingetId: 'TimKosse.FileZilla.Client', githubRepo: undefined, displayName: 'FileZilla' },
  'treesizefree': { wingetId: 'JAMSoftware.TreeSize.Free', githubRepo: undefined, displayName: 'TreeSize Free' },
  
  // Security & VPN
  'nordvpn': { wingetId: 'NordVPN.NordVPN', githubRepo: undefined, displayName: 'NordVPN' },
  'expressvpn': { wingetId: 'ExpressVPN.ExpressVPN', githubRepo: undefined, displayName: 'ExpressVPN' },
  'cisco anyconnect': { wingetId: 'Cisco.AnyConnect', githubRepo: undefined, displayName: 'Cisco AnyConnect' },
  'anyconnect': { wingetId: 'Cisco.AnyConnect', githubRepo: undefined, displayName: 'Cisco AnyConnect' },
  'globalprotect': { wingetId: 'PaloAltoNetworks.GlobalProtect', githubRepo: undefined, displayName: 'GlobalProtect' },
  
  // Remote Desktop
  'anydesk': { wingetId: 'AnyDeskSoftwareGmbH.AnyDesk', githubRepo: undefined, displayName: 'AnyDesk' },
  'teamviewer': { wingetId: 'TeamViewer.TeamViewer', githubRepo: undefined, displayName: 'TeamViewer' },
  'remote desktop': { wingetId: 'Microsoft.RemoteDesktopClient', githubRepo: undefined, displayName: 'Remote Desktop' },
  
  // Runtimes
  'dotnet': { wingetId: 'Microsoft.DotNet.Runtime.8', githubRepo: undefined, displayName: '.NET Runtime' },
  'net runtime': { wingetId: 'Microsoft.DotNet.Runtime.8', githubRepo: undefined, displayName: '.NET Runtime' },
  'java': { wingetId: 'Oracle.JDK.21', githubRepo: undefined, displayName: 'Java JDK' },
  'jdk': { wingetId: 'Oracle.JDK.21', githubRepo: undefined, displayName: 'Java JDK' },
  'jre': { wingetId: 'Oracle.JavaRuntimeEnvironment', githubRepo: undefined, displayName: 'Java Runtime' },
  'visual c': { wingetId: 'Microsoft.VCRedist.2015+.x64', githubRepo: undefined, displayName: 'Visual C++ Redistributable' },
  'vcredist': { wingetId: 'Microsoft.VCRedist.2015+.x64', githubRepo: undefined, displayName: 'Visual C++ Redistributable' },
  
  // Design & Media
  'figma': { wingetId: 'Figma.Figma', githubRepo: undefined, displayName: 'Figma' },
  'gimp': { wingetId: 'GIMP.GIMP', githubRepo: undefined, displayName: 'GIMP' },
  'inkscape': { wingetId: 'Inkscape.Inkscape', githubRepo: undefined, displayName: 'Inkscape' },
  'obs studio': { wingetId: 'OBSProject.OBSStudio', githubRepo: 'obsproject/obs-studio', displayName: 'OBS Studio' },
  'obs': { wingetId: 'OBSProject.OBSStudio', githubRepo: 'obsproject/obs-studio', displayName: 'OBS Studio' },
  'audacity': { wingetId: 'Audacity.Audacity', githubRepo: 'audacity/audacity', displayName: 'Audacity' },
  'handbrake': { wingetId: 'HandBrake.HandBrake', githubRepo: 'HandBrake/HandBrake', displayName: 'HandBrake' },
  'spotify': { wingetId: 'Spotify.Spotify', githubRepo: undefined, displayName: 'Spotify' },
};

// Detect if app is likely a custom/internal script
export function isInternalApp(name: string, publisher?: string): boolean {
  const normalizedName = name.toLowerCase();
  const normalizedPublisher = publisher?.toLowerCase() || '';
  
  // Check for common internal app indicators
  const internalIndicators = [
    'script',
    'internal',
    'custom',
    'in-house',
    'inhouse',
    'company',
    'corp',
    'powershell',
    'ps1',
    'bat',
    'cmd',
    'vbs',
    'remediation',
    'deploy',
    'config',
    'setup script',
    'automation',
  ];
  
  // Check if name contains internal indicators
  if (internalIndicators.some(indicator => normalizedName.includes(indicator))) {
    return true;
  }
  
  // Check if publisher is empty or matches org name patterns
  if (!publisher || normalizedPublisher === '' || normalizedPublisher === 'unknown') {
    // Apps without a publisher are likely internal
    return true;
  }
  
  // Check for GUID-like names (often internal packages)
  if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(normalizedName)) {
    return true;
  }
  
  return false;
}

// Get mapping for an app
export function getAppMapping(name: string): AppMapping | null {
  const normalized = normalizeAppName(name);
  
  // Direct lookup
  if (APP_MAPPINGS[normalized]) {
    return APP_MAPPINGS[normalized];
  }
  
  // Partial match - find best match
  for (const [key, mapping] of Object.entries(APP_MAPPINGS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return mapping;
    }
  }
  
  return null;
}
