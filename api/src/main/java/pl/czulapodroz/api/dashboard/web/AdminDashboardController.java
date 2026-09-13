package pl.czulapodroz.api.dashboard.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.czulapodroz.api.dashboard.DashboardService;
import pl.czulapodroz.api.dashboard.web.dto.DashboardDtos;

/** Pulpit panelu organizatorek. */
@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Administracja")
public class AdminDashboardController {

    private final DashboardService dashboardService;

    public AdminDashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Stan sprzedaży: miejsca, przychód, zamówienia, lista rezerwowa")
    public DashboardDtos.SummaryResponse summary() {
        return dashboardService.summary();
    }
}
