import jsx from '@core/JSX';
import logoIcon from '@assets/logo.webp';
import halfmoonIcon from '@assets/icons/halfmoon.svg';
import sunlightIcon from '@assets/icons/sunlight.svg';
import logoutIcon from '@assets/icons/logout.svg';

interface SidebarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
}

/**
 * 애플리케이션의 왼쪽 고정 사이드바 컴포넌트
 */
export const Sidebar = ({ isDarkMode }: SidebarProps) => {
  return jsx`
    <aside class="sidemenu">
      <img src="${logoIcon}" alt="logo" class="logo-img" />
      <div class="sidemenu-buttons">
        <div class="icon-circle theme-toggle-btn">
          <img src="${isDarkMode ? sunlightIcon : halfmoonIcon}" alt="theme" />
        </div>
        <div class="icon-circle logout-btn">
          <img src="${logoutIcon}" alt="logout" />
        </div>
      </div>
    </aside>
  `;
};
