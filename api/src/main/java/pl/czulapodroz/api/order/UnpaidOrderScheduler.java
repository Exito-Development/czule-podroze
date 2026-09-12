package pl.czulapodroz.api.order;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Zwalnia miejsca z zamówień, których nie opłacono w terminie. */
@Component
public class UnpaidOrderScheduler {

    private static final Logger log = LoggerFactory.getLogger(UnpaidOrderScheduler.class);

    private final OrderPaymentService orderPaymentService;

    public UnpaidOrderScheduler(OrderPaymentService orderPaymentService) {
        this.orderPaymentService = orderPaymentService;
    }

    @Scheduled(fixedDelayString = "${czula.booking.unpaid-scan-interval:PT5M}")
    public void expireUnpaidOrders() {
        int expired = orderPaymentService.expireUnpaidOrders();
        if (expired > 0) {
            log.info("Wygaszono {} nieopłaconych zamówień", expired);
        }
    }
}
