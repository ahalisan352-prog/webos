const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateId = () => {
    return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

window.WebOSUtils = {
    sleep,
    generateId
};