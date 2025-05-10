document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.afkorting');
    const display = document.getElementById('betekenis-display');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const betekenis = button.getAttribute('data-betekenis');
            display.textContent = `Betekenis: ${betekenis}`;
        });
    });
});