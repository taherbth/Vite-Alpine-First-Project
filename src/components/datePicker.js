import flatpickr from 'flatpickr';

export default (getter, setter, config = {}) => ({
    picker: null,
    init() {
        this.$nextTick(() => {
            const initialValue = getter() || '';

            this.picker = flatpickr(this.$el, {
                dateFormat: 'Y-m-d',
                maxDate: 'today',
                defaultDate: initialValue,
                ...config,
                // Fires every time a date is picked or changed
                onChange: (selectedDates, dateStr) => {
                    setter(dateStr);
                    this.$el.value = dateStr;
                },
                onValueUpdate: (selectedDates, dateStr) => {
                    setter(dateStr);
                }
            });

            // Sync from Alpine state -> Flatpickr
            this.$watch(getter, (newVal) => {
                const val = newVal || '';
                if (this.picker && val !== this.picker.input.value) {
                    this.picker.setDate(val, false);
                }
            });
        });
    }
});