async function sendNotification(message) {
  const token = process.env.PUSHPLUS_TOKEN || process.env.token;

  if (!token) {
    const tip = 'PushPlus: 未配置 PUSHPLUS_TOKEN，跳过推送';
    console.log(tip);
    return tip;
  }

  // PushPlus 限制：标题不能超过 100 个字符。
  // 签到失败时 message 可能是一整段很长的报错，直接用作标题会被服务端拒收（code 999）。
  // 这里把标题截断到 90 个字符并压平换行，确保始终能推送成功；完整信息仍放在 content 里。
  const title = `Q:${(message || '签到通知').replace(/\n/g, ' ').slice(0, 90)}`;

  const response = await fetch('http://www.pushplus.plus/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      title,
      content: message,
    }),
  });

  const text = await response.text();
  console.log(text);
  return text;
}

if (require.main === module) {
  const message = process.argv.slice(2).join(' ').trim();

  if (!message) {
    console.error('Usage: node push_notification.js <checkin_message>');
    process.exit(1);
  }

  sendNotification(message).catch((error) => {
    console.error(`PushPlus 推送失败: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  sendNotification,
};
