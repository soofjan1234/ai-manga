import html2canvas from 'html2canvas';
import { Episode } from './store';

/**
 * 将漫画导出为长条图并下载
 */
export async function exportMangaAsLongStrip(episodes: Episode[], title: string = "我的漫画") {
    // 创建一个临时的容器来渲染所有图片
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '0';
    container.style.width = '800px'; // 设定为固定宽度，类似手机条漫
    container.style.backgroundColor = '#ffffff';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '0'; // 条漫通常无缝或小缝隙

    // 过滤出已完成的章节
    const completeEpisodes = episodes.filter(e => e.status === 'complete' && e.images.length > 0);

    if (completeEpisodes.length === 0) {
        alert("还没有生成任何漫画内容哦！");
        return;
    }

    // 标题部分
    const header = document.createElement('div');
    header.style.padding = '40px 20px';
    header.style.textAlign = 'center';
    header.style.backgroundColor = '#1a1a1a';
    header.style.color = '#f5f0e6'; // cream
    header.innerHTML = `
        <h1 style="font-family: serif; font-size: 32px; margin-bottom: 10px;">${title}</h1>
        <p style="font-family: monospace; font-size: 14px; opacity: 0.7;">Created with AI Manga</p>
    `;
    container.appendChild(header);

    // 遍历添加每一页
    for (const episode of completeEpisodes) {
        const episodeContainer = document.createElement('div');
        episodeContainer.style.position = 'relative';

        // 图片
        const img = document.createElement('img');
        img.src = episode.images[0];
        img.style.width = '100%';
        img.style.display = 'block';
        episodeContainer.appendChild(img);

        // 如果想把大纲作为旁白加进去
        // const caption = document.createElement('div');
        // caption.style.padding = '20px';
        // caption.style.fontSize = '16px';
        // caption.style.lineHeight = '1.6';
        // caption.style.fontFamily = 'serif';
        // caption.innerText = episode.outline;
        // episodeContainer.appendChild(caption);

        container.appendChild(episodeContainer);
    }

    // 结尾部分
    const footer = document.createElement('div');
    footer.style.padding = '40px 20px';
    footer.style.textAlign = 'center';
    footer.style.backgroundColor = '#1a1a1a';
    footer.style.color = '#f5f0e6';
    footer.innerHTML = `
        <p style="font-family: monospace; font-size: 12px; opacity: 0.5;">THE END</p>
    `;
    container.appendChild(footer);

    document.body.appendChild(container);

    try {
        const canvas = await html2canvas(container, {
            useCORS: true,
            allowTaint: true,
            scale: 2 // 高清导出
        });

        // 触发下载
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${title.replace(/\s+/g, '_')}_long_strip.png`;
        link.href = dataUrl;
        link.click();

    } catch (error) {
        console.error("Export failed:", error);
        alert("导出失败，请重试或检查浏览器控制台。");
    } finally {
        document.body.removeChild(container);
    }
}
