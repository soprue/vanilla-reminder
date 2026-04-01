import jsx from '@core/JSX';
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
export const Sidebar = ({ isDarkMode, onToggleTheme, onLogout }: SidebarProps) => {
  return jsx`
    <aside class="sidemenu">
      <div class="logo-img"></div>
      <div class="sidemenu-buttons">
        <div class="icon-circle" onclick="${onToggleTheme}">
          <img src="${isDarkMode ? sunlightIcon : halfmoonIcon}" alt="theme" />
        </div>
        <div class="icon-circle" onclick="${onLogout}">
          <img src="${logoutIcon}" alt="logout" />
        </div>
      </div>
    </aside>
  `;
};
