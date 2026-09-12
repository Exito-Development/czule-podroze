package pl.czulapodroz.api.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Dokumentacja API — dostępna pod `/swagger-ui.html`. */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI czulaPodrozOpenApi() {
        return new OpenAPI()
                .info(
                        new Info()
                                .title("Czuła Podróż API")
                                .version("v1")
                                .description(
                                        "Katalog wyjazdów, koszyk z blokadą miejsc, zamówienia, "
                                                + "płatności, lista rezerwowa i podgląd rezerwacji.")
                                .contact(new Contact().name("Czuła Podróż")))
                .components(
                        new Components()
                                .addSecuritySchemes(
                                        "bearer-jwt",
                                        new SecurityScheme()
                                                .type(SecurityScheme.Type.HTTP)
                                                .scheme("bearer")
                                                .bearerFormat("JWT")));
    }
}
