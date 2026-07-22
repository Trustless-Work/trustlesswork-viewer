export const Header = () => {
  return (
    <div className="mb-6 flex flex-col gap-2">
      <h1 className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">
        Escrow Viewer
      </h1>
      <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
        View detailed information about any escrow contract on the Stellar
        blockchain.
      </p>
    </div>
  );
};
