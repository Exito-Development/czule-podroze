package pl.czulapodroz.api.catalog.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Arrays;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.czulapodroz.api.catalog.domain.Continent;

/** Kategorie ofert — źródło prawdy dla filtra na stronie. */
@RestController
@RequestMapping("/api/v1/continents")
@Tag(name = "Katalog")
public class ContinentController {

    @GetMapping
    @Operation(summary = "Kontynenty, na których mamy wyjazdy")
    public List<String> list() {
        return Arrays.stream(Continent.values()).map(Continent::polishName).toList();
    }
}
