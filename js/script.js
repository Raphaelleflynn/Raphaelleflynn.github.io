document.addEventListener("DOMContentLoaded", function () {
    // 使用更可靠的选择器
    const menuButton = document.getElementById('custom-menu-icon');
    const navlist = document.querySelector('.navlist');
    const menuMask = document.querySelector('.menu-mask');
    
    // 状态管理变量
    let isMenuOpen = false;

    // 增强型菜单切换
    const toggleMenu = (forceClose) => {
        isMenuOpen = forceClose ? false : !isMenuOpen;
        
        // 同步所有相关元素状态
        const actions = [
            [navlist, 'active'],
            [menuMask, 'active'],
            [menuButton, 'active']
        ];

        actions.forEach(([element, className]) => {
            element?.classList.toggle(className, isMenuOpen);
        });

        // 滚动锁定/解锁（兼容 Safari）
        document.documentElement.style.overflow = isMenuOpen ? 'hidden' : '';
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';

        // 无障碍属性更新
        if (menuButton) {
            menuButton.setAttribute('aria-expanded', isMenuOpen);
        }
    };

    // 可靠的事件绑定
    if (menuButton) {
        menuButton.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止事件冒泡
            toggleMenu();
        });
    }

    // 遮罩层关闭（添加存在性检查）
    if (menuMask) {
        menuMask.addEventListener('click', () => toggleMenu(true));
    }

    // 响应式重置（添加防抖优化）
    let resizeTimer;
    const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth >= 1024 && isMenuOpen) {
                toggleMenu(true);
            }
        }, 100);
    };

    // 添加过渡结束监听
    navlist?.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'transform') {
            navlist.style.overflow = isMenuOpen ? 'visible' : 'hidden';
        }
    });

    // 增强的窗口监听
    window.addEventListener('resize', handleResize);
    
    // ESC 键关闭支持
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMenu(true);
        }
    });

    // 点击外部关闭菜单
    document.addEventListener('click', (e) => {
        if (isMenuOpen && 
            !e.target.closest('.navlist') && 
            !e.target.closest('#custom-menu-icon')
        ) {
            toggleMenu(true);
        }
    });
});


    // ==================== 其他功能 ==================== 
    // 跑马灯内容复制（添加防重复检查）
    const marqueeContent = document.querySelector(".marquee-content");
    if (marqueeContent.children.length < 10) {
        const originalContent = marqueeContent.cloneNode(true);
        marqueeContent.append(...originalContent.children);
    }

    // 邮件链接处理（优化编码）
    document.addEventListener('DOMContentLoaded', function() {
        const emailLinks = document.querySelectorAll('.encrypted-email');
        
        emailLinks.forEach(link => {
            const user = link.dataset.user;
            const domain = link.dataset.domain;
            link.href = `mailto:${user}@${domain}`;
            
            // 可选：点击时显示完整邮箱
            link.addEventListener('click', (e) => {
                e.preventDefault();
                link.querySelector('.email-text').textContent = `${user}@${domain}`;
                setTimeout(() => window.location.href = `mailto:${user}@${domain}`, 1000);
            });
        });
    });