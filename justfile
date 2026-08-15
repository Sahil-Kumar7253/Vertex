set windows-shell := ["powershell.exe", "-NoLogo", "-Command"]

backendCheck:
    cd vertex-api; ./mvnw clean verify

backend:
    cd vertex-api; ./mvnw spring-boot:run

# Run the Next.js frontend
frontend:
    cd vertex-web; npm run dev

# Run both at the same time (optional)
both:
    just backend; just frontend