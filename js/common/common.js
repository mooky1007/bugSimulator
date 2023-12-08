const activeMenu = () => {
    document.querySelectorAll('aside ul li').forEach((el) => {
        if (!el.querySelector('a')) return;
        if (el.querySelector('a').href === window.location.href) {
            el.classList.add('active');
        }
    });
}

const createSideMenus = () => {
    const ul = document.querySelector('aside ul');
    ul.innerHTML = '';

    const menus = [
        { name: '개체군 <span>Population</span>', link: './', type: 'title' },
        { name: '개체군 생태학<br><span>Population Ecology</span>', link: './' },
        { name: '개체군 성장 모델 - 지수 개체군 성장모델<br><span>Exponential Population Growth</span>', link: './populationGrowth.html' },
        { name: '개체군 성장 모델 - 로지스틱 개체군 모델<br><span>Logistic Population Growth</span>', link: './populationGrowth2.html' },
        { name: '개체군 성장의 조절 - 밀도의존적 인자<br><span>Density Dependent Factor</span>', link: './densityDependentFactor.html' },
        { name: '인구통계학<br><span>Demography</span>', link: './demography.html' },
        { name: '군집 <span>Community</span>', link: './', type: 'title', disabled: true },
        { name: '생태군집<br><span>Ecological Community</span>', link: '#', disabled: true },
    ];

    menus.forEach((menu) => {
        const li = document.createElement('li');
        if (menu.type === 'title') {
            li.classList.add('title');
            const p = document.createElement('p');
            p.innerHTML = menu.name;
            li.appendChild(p);
        }else{
            const a = document.createElement('a');
            a.href = menu.link;
            a.innerHTML = menu.name;
            li.appendChild(a);
        }

        if(menu.disabled) li.style.opacity = 0.5;
        ul.appendChild(li);
    });

    activeMenu();
}

createSideMenus();