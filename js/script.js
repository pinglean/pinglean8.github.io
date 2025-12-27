
document.addEventListener('DOMContentLoaded', () => {
    initSessionInfo();
    renderSeats();
    updateSummary();

    document.getElementById('btn-buy-all').addEventListener('click', showModal);
    document.getElementById('modal-cancel').addEventListener('click', hideModal);
    document.getElementById('modal-confirm').addEventListener('click', confirmBuyAll);
    document.getElementById('btn-confirm').addEventListener('click', showSeatListModal);

    document.getElementById('modal-list-cancel').addEventListener('click', hideSeatListModal);
    document.getElementById('modal-list-pay').addEventListener('click', finalPay);
});

/* --- Data & Config --- */
const PRICES = { standard: 500, comfort: 550 };
const TIMES = ['10:40', '13:10', '15:40', '18:10', '20:35', '23:00'];
const DISCOUNT_RATE = 0.8; // 20% discount
let bulkDiscountActive = false;

const HALL_CONFIG = [
    { row: 1, type: 'standard', pattern: [1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1] },
    { row: 2, type: 'standard', pattern: [1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1] },
    { row: 3, type: 'standard', pattern: [1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1] },
    { row: 4, type: 'standard', pattern: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    { row: 5, type: 'standard', pattern: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    { row: 6, type: 'comfort', pattern: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    { row: 7, type: 'standard', pattern: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    { row: 8, type: 'standard', pattern: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }
];

const DOC_OCCUPIED = ['4-7', '4-8', '8-1', '8-2'];

const SEAT_PATH_1 = "M26 5H7V11H4V27H28V11H26V5Z";
const SEAT_PATH_2 = "M24 5.3H8C7.6134 5.3 7.3 5.6134 7.3 6V10.3223C7.63435 10.3726 7.9416 10.5057 8.20021 10.7C8.20022 10.7 8.20022 10.7 8.20023 10.7C8.68588 11.0649 9 11.6458 9 12.3V22H23V12.3C23 11.6458 23.3141 11.0649 23.7998 10.7C24.0584 10.5057 24.3656 10.3726 24.7 10.3223V6C24.7 5.6134 24.3866 5.3 24 5.3ZM26 10.3V6C26 4.89543 25.1046 4 24 4H8C6.89543 4 6 4.89543 6 6V10.3H5C3.89543 10.3 3 11.1954 3 19 12.3V22V23.3V26C3 27.1046 3.89543 28 5 28H27C28.1046 28 29 27.1046 29 26V23.3V22V12.3C29 11.1954 28.1046 10.3 27 10.3H26ZM4.3 12.3C4.3 11.9134 4.6134 11.6 5 11.6H7C7.3866 11.6 7.7 11.9134 7.7 12.3V22H4.3V12.3ZM27.7 12.3V22L24.3 22V12.3C24.3 11.9134 24.6134 11.6 25 11.6H27C27.3866 11.6 27.7 11.9134 27.7 12.3ZM4.3 23.3H27.7V26C27.7 26.3866 27.3866 27 26.7H5C4.6134 26.7 4.3 26.3866 4.3 26V23.3Z";
const TICKET_PATH = "M16.813 0c-.434 0-1.071.578-1.33.828l-.623.611a.572.572 0 0 1-.402.16.574.574 0 0 1-.402-.16l-.633-.613C12.998.416 12.293 0 11.769 0s-1.229.416-1.654.826l-.634.613a.578.578 0 0 1-.405.16.578.578 0 0 1-.405-.16L8.036.826C7.622.426 6.901 0 6.382 0c-.52 0-1.24.426-1.654.826l-.635.613a.579.579 0 0 1-.405.16.579.579 0 0 1-.405-.16L2.648.826C2.613.793 1.772 0 1.263 0 .683 0 .461.787.461 1.461V18.54c0 .674.221 1.461.802 1.461.49 0 1.279-.742 1.365-.825l.645-.614a.585.585 0 0 1 .409-.16c.155 0 .3.057.408.16l.636.613c.414.4 1.135.826 1.655.826s1.24-.426 1.655-.826l.635-.613a.578.578 0 0 1 .405-.16c.155 0 .299.057.405.16l.635.613c.414.4 1.135.826 1.654.826.52 0 1.24-.426 1.655-.826l.634-.613a.578.578 0 0 1 .405-.16c.155 0 .299.057.405.16l.635.613c.32.308.9.826 1.309.826.478 0 .726-.519.726-1.461V1.46c0-.94-.249-1.46-.726-1.46zm-3.018 15.023H9.593v-1.735h4.2v1.735zm0-4.201H4.296V9.178h9.497v1.644zm0-4.11H4.296V4.977h9.497v1.735z";
const CROSS_PATH = "M15 1.5l-1.5-1.5-6 6-6-6-1.5 1.5 6 6-6 6 1.5 1.5 6-6 6 6 1.5-1.5-6-6z";

/* --- Initialization --- */
function initSessionInfo() {
    const now = new Date();
    const options = { day: 'numeric', month: 'long', weekday: 'long' };
    document.getElementById('session-date').textContent = now.toLocaleDateString('ru-RU', options);

    const randomTime = TIMES[Math.floor(Math.random() * TIMES.length)];
    document.getElementById('session-time').textContent = randomTime;
}

function renderSeats() {
    const container = document.getElementById('seats-grid');
    container.innerHTML = '';

    HALL_CONFIG.forEach(rowConfig => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'seat-row';

        const rowNumL = document.createElement('div');
        rowNumL.className = 'row-number';
        rowNumL.textContent = rowConfig.row;
        rowDiv.appendChild(rowNumL);

        let seatNum = 14;

        rowConfig.pattern.forEach(slot => {
            if (slot === 1) {
                const seatId = `${rowConfig.row}-${seatNum}`;
                const seatDiv = document.createElement('div');
                seatDiv.className = `seat ${rowConfig.type}`;
                seatDiv.dataset.id = seatId;
                seatDiv.dataset.row = rowConfig.row;
                seatDiv.dataset.col = seatNum;
                seatDiv.dataset.type = rowConfig.type;
                seatDiv.dataset.price = PRICES[rowConfig.type];

                if (DOC_OCCUPIED.includes(seatId)) {
                    seatDiv.classList.add('occupied');
                    seatDiv.title = 'Занято';
                }

                seatDiv.innerHTML = getSeatSVG(rowConfig.type, seatDiv.classList.contains('occupied') ? 'occupied' : 'free');

                seatDiv.addEventListener('click', () => handleSeatClick(seatDiv));
                // Remove outdated handlers for icon swapping

                rowDiv.appendChild(seatDiv);

                seatNum--;
            } else {
                const gap = document.createElement('div');
                gap.style.width = '32px';
                rowDiv.appendChild(gap);
                seatNum--;
            }
        });

        const rowNumR = document.createElement('div');
        rowNumR.className = 'row-number right';
        rowNumR.textContent = rowConfig.row;
        rowDiv.appendChild(rowNumR);

        container.appendChild(rowDiv);
    });
}

function getSeatSVG(type, state) {
    let color = '#a5a5a5';
    if (type === 'comfort') color = '#e5cfee';
    if (state === 'occupied') color = 'rgba(80, 80, 80, 0.8)';
    if (state === 'selected') color = '#bd257f';

    return `
    <svg width="32" height="32" viewBox="0 0 32 32" class="icon-seat" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.2" fill-rule="evenodd" clip-rule="evenodd" d="${SEAT_PATH_1}" fill="${color}"></path>
        <path fill-rule="evenodd" clip-rule="evenodd" d="${SEAT_PATH_2}" fill="${color}"></path>
    </svg>
    `;
}

function getTicketSVG() {
    return `
    <svg width="18" height="20" viewBox="0 0 18 20" class="icon-ticket" xmlns="http://www.w3.org/2000/svg">
        <path d="${TICKET_PATH}" fill="#bd257f"></path>
    </svg>
    `;
}

function getCrossSVG() {
    return `
    <svg width="20" height="20" viewBox="0 0 20 20" class="icon-cross" xmlns="http://www.w3.org/2000/svg">
         <path d="${CROSS_PATH}" fill="#fff"></path>
    </svg>
    `;
}

/* --- Interaction --- */

function handleSeatClick(seatDiv) {
    if (seatDiv.classList.contains('occupied')) return;

    // Manual interaction resets discount
    bulkDiscountActive = false;

    if (seatDiv.classList.contains('selected')) {
        deselectSeat(seatDiv);
    } else {
        if (validateSelection(seatDiv)) {
            selectSeat(seatDiv);
        } else {
            shakeNotification();
        }
    }
    updateSummary();
}

function selectSeat(seatDiv) {
    seatDiv.classList.add('selected');
    seatDiv.innerHTML = getSeatSVG(seatDiv.dataset.type, 'selected');
}

function deselectSeat(seatDiv) {
    seatDiv.classList.remove('selected');
    seatDiv.innerHTML = getSeatSVG(seatDiv.dataset.type, 'free');
}


/* --- Validation --- */
function validateSelection(seatDiv) {
    const row = seatDiv.dataset.row;

    const rowSeats = Array.from(document.querySelectorAll(`.seat[data-row="${row}"]`));

    const relevantIndices = rowSeats.map(s => {
        return {
            col: parseInt(s.dataset.col),
            status: s.classList.contains('occupied') || s.classList.contains('selected') || s === seatDiv ? 'busy' : 'free'
        };
    });

    relevantIndices.sort((a, b) => b.col - a.col);

    let valid = true;
    for (let i = 0; i < relevantIndices.length - 2; i++) {
        const left = relevantIndices[i];
        const middle = relevantIndices[i + 1];
        const right = relevantIndices[i + 2];

        if (left.col - middle.col === 1 && middle.col - right.col === 1) {
            if (left.status === 'busy' && middle.status === 'free' && right.status === 'busy') {
                valid = false;
            }
        }
    }

    return valid;
}

function shakeNotification() {
    const notif = document.getElementById('notification-area');
    notif.classList.remove('hidden');
    document.body.classList.add('shake');
    setTimeout(() => {
        document.body.classList.remove('shake');
        setTimeout(() => notif.classList.add('hidden'), 3000);
    }, 500);
}

/* --- Pricing & Footer --- */
function updateSummary() {
    const selected = document.querySelectorAll('.seat.selected');
    const btnConfirm = document.getElementById('btn-confirm');
    const btnBuyAll = document.getElementById('btn-buy-all');

    if (selected.length > 0) {
        let total = 0;
        selected.forEach(s => total += parseInt(s.dataset.price));

        let label = `ПРОДОЛЖИТЬ: ${total} ₽`;
        if (bulkDiscountActive) {
            const discounted = Math.round(total * DISCOUNT_RATE);
            label = `СКИДКА: ${discounted} ₽ (<s>${total}</s>)`;
        }

        btnConfirm.innerHTML = label;
        btnConfirm.disabled = false;
        btnBuyAll.disabled = true;
    } else {
        btnConfirm.textContent = 'ПРОДОЛЖИТЬ';
        btnConfirm.disabled = true;
        btnBuyAll.disabled = false;
    }
}

/* --- Modal Logic (Buy All) --- */
function showModal() {
    const modalContent = document.querySelector('.modal-content');
    modalContent.innerHTML = 'Вы действительно хотите<br>выкупить весь зал?<br><span style="font-size:0.8em;color:#bd257f;">(Скидка 20%)</span>';
    document.getElementById('modal-container').classList.remove('hidden');
}

function hideModal() {
    document.getElementById('modal-container').classList.add('hidden');
}

function confirmBuyAll() {
    hideModal();
    bulkDiscountActive = true;
    const freeSeats = document.querySelectorAll('.seat:not(.occupied):not(.selected)');
    freeSeats.forEach(s => {
        selectSeat(s);
    });
    updateSummary();
}

/* --- Seat List Modal Logic --- */
function showSeatListModal() {
    const selected = document.querySelectorAll('.seat.selected');
    const container = document.getElementById('seat-list-content');
    container.innerHTML = '';

    selected.forEach(s => {
        const row = s.dataset.row;
        const col = s.dataset.col;
        const type = s.dataset.type === 'comfort' ? 'Комфорт' : 'Стандарт';
        const price = s.dataset.price;
        const id = s.dataset.id;

        const item = document.createElement('div');
        item.className = 'seat-list-item';
        item.innerHTML = `
            <div class="seat-info-row">${row} ряд, ${col} место</div>
            <div class="seat-type">${type}</div>
            <div class="seat-price">
                <span class="price-tag">Взрослый</span> 
                <span class="price-value">${price} ₽</span>
            </div>
            <button class="btn-remove-seat" title="Удалить">
               ${getCrossSVG()}
            </button>
        `;

        item.querySelector('.btn-remove-seat').addEventListener('click', () => {
            deselectSeat(s);
            item.remove();
            updateSummary();
            if (document.querySelectorAll('.seat.selected').length === 0) {
                hideSeatListModal();
            }
        });

        container.appendChild(item);
    });

    document.getElementById('seat-list-modal-container').classList.remove('hidden');
}

function hideSeatListModal() {
    document.getElementById('seat-list-modal-container').classList.add('hidden');
}

function finalPay() {
    hideSeatListModal();
    alert('Переход к оплате...');
}
