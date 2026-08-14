from typing import List, Optional
import httpx
from src.core.config import settings
from src.schemas.event_schema import TicketmasterEventItem


class TicketmasterService:
    @staticmethod
    async def search_events(
        keyword: Optional[str] = None,
        city: Optional[str] = None,
        size: int = 10
    ) -> List[TicketmasterEventItem]:

        params = {
            "apikey": settings.TICKETMASTER_API_KEY,
            "size": size,
        }

        if keyword:
            params["keyword"] = keyword
            
        if city:
            params["city"] = city

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{settings.TICKETMASTER_BASE_URL}/events.json",
                params=params
            )

            if response.status_code != 200:
                return []

            data = response.json()
            events_data = data.get("_embedded", {}).get("events", [])

            results: List[TicketmasterEventItem] = []
            for item in events_data:
                images = item.get("images", [])
                if images:
                    banner = images[0].get("url")
                else:
                    banner = None


                venues = item.get("_embedded", {}).get("venues", [])
                if venues:
                    venue_name = venues[0].get("name")
                else:
                    venue_name = "Local a definir"


                if venues:
                    venue_city = venues[0].get("city", {}).get("name")
                else:
                    venue_city = "Cidade a definir"

                    
                classifications = item.get("classifications", [])
                category = "Geral"
                if classifications:
                    segment = classifications[0].get("segment", {}).get("name", "")
                    genre = classifications[0].get("genre", {}).get("name", "")
                    category = f"{segment} / {genre}".strip(" /")

                results.append(
                    TicketmasterEventItem(
                        external_id=item.get("id", ""),
                        title=item.get("name", "Evento sem título"),
                        category=category,
                        banner_url=banner,
                        suggested_venue=venue_name,
                        suggested_city=venue_city
                    )
                )

            return results
