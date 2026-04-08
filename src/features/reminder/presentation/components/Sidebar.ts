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
export const Sidebar = ({ isDarkMode, onToggleTheme, onLogout }: SidebarProps) => {
  return jsx`
    <aside class="sidemenu">
      <img src="${logoIcon}" alt="logo" class="logo-img" />
      <div class="sidemenu-buttons">
        <div class="icon-circle" onclick="${onToggleTheme}">
          <!-- 다크모드 대응을 위해 mask-image 방식 적용 -->
          <div class="icon-mask" style="mask-image: url(${isDarkMode ? sunlightIcon : halfmoonIcon}); -webkit-mask-image: url(${isDarkMode ? sunlightIcon : halfmoonIcon});"></div>
        </div>
        <div class="icon-circle" onclick="${onLogout}">
          <div class="icon-mask" style="mask-image: url(${logoutIcon}); -webkit-mask-image: url(${logoutIcon});"></div>
        </div>
      </div>
    </aside>
  `;
};
