import { ROLE_ICONS } from "@/lib/escrow-constants";
import type { Icon } from "@phosphor-icons/react";

interface RoleIconProps {
  title: string;
  className?: string;
}

export const RoleIcon: React.FC<RoleIconProps> = ({
  title,
  className = "size-4",
}) => {
  const roleData = ROLE_ICONS[title];
  const IconComponent: Icon =
    roleData?.icon ?? ROLE_ICONS["Service Provider"].icon;

  return (
    <div className="text-foreground">
      <IconComponent className={className} weight="duotone" />
    </div>
  );
};

export default RoleIcon;
