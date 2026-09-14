package pl.czulapodroz.api.order;

import org.springframework.stereotype.Component;
import pl.czulapodroz.api.order.domain.Customer;
import pl.czulapodroz.api.order.domain.OrderItem;
import pl.czulapodroz.api.order.domain.TripOrder;
import pl.czulapodroz.api.order.web.dto.OrderDtos;

/** Tłumaczy zamówienia na odpowiedzi API. */
@Component
public class OrderMapper {

    public OrderDtos.OrderResponse toResponse(TripOrder order) {
        return new OrderDtos.OrderResponse(
                order.getOrderNumber(),
                order.getStatus().name(),
                order.getCurrency(),
                order.getAmountDueNow(),
                order.getAmountPaid(),
                order.getTripTotal(),
                order.balanceDue(),
                order.getPaymentDeadline(),
                order.getPaidAt(),
                order.getCreatedAt(),
                toCustomerResponse(order.getCustomer()),
                order.getItems().stream().map(OrderMapper::toItemResponse).toList());
    }

    private static OrderDtos.CustomerResponse toCustomerResponse(Customer customer) {
        return new OrderDtos.CustomerResponse(
                customer.getFirstName(),
                customer.getLastName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getNote());
    }

    private static OrderDtos.OrderItemResponse toItemResponse(OrderItem item) {
        return new OrderDtos.OrderItemResponse(
                item.getTripSlug(),
                item.getTripTitle(),
                item.getSeats(),
                item.getPaymentMode().name(),
                item.getUnitPrice(),
                item.getDepositPerSeat(),
                item.getAmountDueNow(),
                item.getTripTotal(),
                item.balanceDue());
    }
}
